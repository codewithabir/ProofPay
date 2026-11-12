import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ProofPay"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "proofpay_super_secret_jwt_key_hackathon_2026_dev")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for dev convenience

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./proofpay.db")

    # PayPal Config
    PAYPAL_MODE: str = os.getenv("PAYPAL_MODE", "sandbox")  # sandbox | live | simulation
    PAYPAL_CLIENT_ID: str = os.getenv("PAYPAL_CLIENT_ID", "")
    PAYPAL_CLIENT_SECRET: str = os.getenv("PAYPAL_CLIENT_SECRET", "")
    PAYPAL_WEBHOOK_ID: str = os.getenv("PAYPAL_WEBHOOK_ID", "")
    PAYPAL_API_BASE_URL: str = "https://api-m.sandbox.paypal.com"

    # AI Verification Config
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Storage Config
    STORAGE_TYPE: str = "local"
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "app/storage/uploads")
    MAX_FILE_SIZE_MB: int = 25
    ALLOWED_EXTENSIONS: set = {
        "png", "jpg", "jpeg", "webp", "gif",
        "pdf", "txt", "md",
        "py", "js", "ts", "tsx", "jsx", "html", "css", "json", "sql"
    }

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
