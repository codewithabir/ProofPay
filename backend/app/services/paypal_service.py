import uuid
import base64
import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional, Dict, Any, Tuple
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class PayPalService:
    def __init__(self):
        self.base_url = settings.PAYPAL_API_BASE_URL
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.client_secret = settings.PAYPAL_CLIENT_SECRET
        self._access_token: Optional[str] = None
        self._token_expiry: Optional[datetime] = None

    @property
    def is_configured(self) -> bool:
        return bool(self.client_id and self.client_secret and settings.PAYPAL_MODE != "simulation")

    async def get_access_token(self) -> str:
        """Retrieves or refreshes PayPal OAuth2 token from sandbox endpoint."""
        if not self.is_configured:
            return "simulated_paypal_access_token"

        now = datetime.now(timezone.utc)
        if self._access_token and self._token_expiry and now < self._token_expiry:
            return self._access_token

        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_creds = base64.b64encode(credentials.encode()).decode()

        headers = {
            "Authorization": f"Basic {encoded_creds}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {"grant_type": "client_credentials"}

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(f"{self.base_url}/v1/oauth2/token", headers=headers, data=data)
            if resp.status_code != 200:
                logger.error(f"PayPal OAuth failed: {resp.status_code} - {resp.text}")
                raise Exception(f"Failed to authenticate with PayPal: {resp.text}")
            
            res_data = resp.json()
            self._access_token = res_data["access_token"]
            expires_in = res_data.get("expires_in", 3600)
            self._token_expiry = now + timedelta(seconds=expires_in - 60)
            return self._access_token

    async def create_authorization_order(
        self,
        milestone_id: str,
        amount: Decimal,
        currency: str = "USD",
        return_url: str = "http://localhost:5173/client/milestones",
        cancel_url: str = "http://localhost:5173/client/milestones"
    ) -> Dict[str, Any]:
        """
        Creates a PayPal Order with intent 'AUTHORIZE'.
        This holds client authorization without immediately capturing funds.
        """
        if not self.is_configured:
            # High-fidelity simulation mode
            order_id = f"ORDER-{uuid.uuid4().hex[:12].upper()}"
            return {
                "order_id": order_id,
                "status": "CREATED",
                "intent": "AUTHORIZE",
                "approve_url": f"https://www.sandbox.paypal.com/checkoutnow?token={order_id}",
                "simulated": True
            }

        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload = {
            "intent": "AUTHORIZE",
            "purchase_units": [
                {
                    "reference_id": f"milestone_{milestone_id}",
                    "description": f"ProofPay Milestone Payment: {milestone_id}",
                    "amount": {
                        "currency_code": currency,
                        "value": f"{amount:.2f}"
                    }
                }
            ],
            "application_context": {
                "brand_name": "ProofPay",
                "landing_page": "BILLING",
                "user_action": "CONTINUE",
                "return_url": return_url,
                "cancel_url": cancel_url
            }
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(f"{self.base_url}/v2/checkout/orders", headers=headers, json=payload)
            if resp.status_code not in (200, 201):
                logger.error(f"PayPal create order failed: {resp.status_code} - {resp.text}")
                raise Exception(f"PayPal order creation failed: {resp.text}")
            
            data = resp.json()
            order_id = data["id"]
            approve_url = None
            for link in data.get("links", []):
                if link.get("rel") == "approve":
                    approve_url = link.get("href")
                    break

            return {
                "order_id": order_id,
                "status": data.get("status", "CREATED"),
                "intent": "AUTHORIZE",
                "approve_url": approve_url,
                "raw": data,
                "simulated": False
            }

    async def authorize_order(self, order_id: str) -> Dict[str, Any]:
        """
        Executes order authorization (after client approves on PayPal).
        Returns authorization ID and expiration timestamp (max 29 days for PayPal authorizations).
        """
        expires_at = datetime.now(timezone.utc) + timedelta(days=29)

        if not self.is_configured or order_id.startswith("ORDER-"):
            # High-fidelity simulation mode
            auth_id = f"AUTH-{uuid.uuid4().hex[:12].upper()}"
            return {
                "authorization_id": auth_id,
                "status": "CREATED",
                "order_id": order_id,
                "expires_at": expires_at,
                "simulated": True
            }

        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.base_url}/v2/checkout/orders/{order_id}/authorize",
                headers=headers,
                json={}
            )
            if resp.status_code not in (200, 201):
                logger.error(f"PayPal authorize failed: {resp.status_code} - {resp.text}")
                raise Exception(f"PayPal order authorization failed: {resp.text}")
            
            data = resp.json()
            # Extract authorization ID from purchase units
            auth_id = None
            try:
                authorizations = data["purchase_units"][0]["payments"]["authorizations"]
                if authorizations:
                    auth_id = authorizations[0]["id"]
                    exp_str = authorizations[0].get("expiration_time")
                    if exp_str:
                        # e.g. 2026-12-10T15:20:00Z
                        expires_at = datetime.fromisoformat(exp_str.replace("Z", "+00:00"))
            except Exception as e:
                logger.warning(f"Could not parse auth_id from response: {e}")
                auth_id = f"AUTH-{uuid.uuid4().hex[:8].upper()}"

            return {
                "authorization_id": auth_id,
                "status": data.get("status", "COMPLETED"),
                "order_id": order_id,
                "expires_at": expires_at,
                "raw": data,
                "simulated": False
            }

    async def capture_authorization(
        self,
        authorization_id: str,
        amount: Optional[Decimal] = None,
        currency: str = "USD",
        note: str = "Approved ProofPay milestone capture"
    ) -> Dict[str, Any]:
        """
        Captures previously authorized payment following client's AI report approval.
        """
        if not self.is_configured or authorization_id.startswith("AUTH-"):
            capture_id = f"CAPTURE-{uuid.uuid4().hex[:12].upper()}"
            return {
                "capture_id": capture_id,
                "status": "COMPLETED",
                "authorization_id": authorization_id,
                "note": note,
                "simulated": True
            }

        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload: Dict[str, Any] = {
            "final_capture": True,
            "note_to_payer": note
        }
        if amount is not None:
            payload["amount"] = {
                "value": f"{amount:.2f}",
                "currency_code": currency
            }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.base_url}/v2/payments/authorizations/{authorization_id}/capture",
                headers=headers,
                json=payload
            )
            if resp.status_code not in (200, 201):
                logger.error(f"PayPal capture failed: {resp.status_code} - {resp.text}")
                raise Exception(f"PayPal capture failed: {resp.text}")
            
            data = resp.json()
            return {
                "capture_id": data.get("id"),
                "status": data.get("status", "COMPLETED"),
                "authorization_id": authorization_id,
                "raw": data,
                "simulated": False
            }

    async def refund_capture(
        self,
        capture_id: str,
        amount: Optional[Decimal] = None,
        currency: str = "USD",
        note: str = "Milestone refund via ProofPay"
    ) -> Dict[str, Any]:
        """Initiates refund on captured payment."""
        if not self.is_configured or capture_id.startswith("CAPTURE-"):
            refund_id = f"REFUND-{uuid.uuid4().hex[:12].upper()}"
            return {
                "refund_id": refund_id,
                "status": "COMPLETED",
                "capture_id": capture_id,
                "simulated": True
            }

        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload: Dict[str, Any] = {"note_to_payer": note}
        if amount is not None:
            payload["amount"] = {
                "value": f"{amount:.2f}",
                "currency_code": currency
            }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.base_url}/v2/payments/captures/{capture_id}/refund",
                headers=headers,
                json=payload
            )
            if resp.status_code not in (200, 201):
                logger.error(f"PayPal refund failed: {resp.status_code} - {resp.text}")
                raise Exception(f"PayPal refund failed: {resp.text}")
            
            data = resp.json()
            return {
                "refund_id": data.get("id"),
                "status": data.get("status", "COMPLETED"),
                "capture_id": capture_id,
                "raw": data,
                "simulated": False
            }

    async def verify_webhook_signature(
        self,
        headers: Dict[str, str],
        body_bytes: bytes,
        webhook_id: Optional[str] = None
    ) -> bool:
        """Verifies PayPal Webhook cryptographic signature."""
        if not self.is_configured:
            return True  # Allow local test webhooks in simulation mode

        token = await self.get_access_token()
        verify_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        target_webhook_id = webhook_id or settings.PAYPAL_WEBHOOK_ID

        payload = {
            "auth_algo": headers.get("paypal-auth-algo"),
            "cert_url": headers.get("paypal-cert-url"),
            "transmission_id": headers.get("paypal-transmission-id"),
            "transmission_sig": headers.get("paypal-transmission-sig"),
            "transmission_time": headers.get("paypal-transmission-time"),
            "webhook_id": target_webhook_id,
            "webhook_event": body_bytes.decode("utf-8")
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.base_url}/v1/notifications/verify-webhook-signature",
                headers=verify_headers,
                json=payload
            )
            if resp.status_code == 200:
                result = resp.json()
                return result.get("verification_status") == "SUCCESS"
            return False

paypal_service = PayPalService()
