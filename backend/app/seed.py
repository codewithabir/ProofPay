import os
import uuid
from decimal import Decimal
from datetime import datetime, timedelta, timezone
from PIL import Image, ImageDraw, ImageFont

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.project import Project, ProjectRequirement
from app.models.milestone import Milestone
from app.models.payment import Payment, PaymentEvent
from app.models.notification import Notification

def generate_sample_images(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)

    # 1. Desktop Hero Screenshot (1280x720)
    desktop_img = Image.new("RGB", (1280, 720), color="#101B33")
    draw = ImageDraw.Draw(desktop_img)
    # Header bar
    draw.rectangle([0, 0, 1280, 70], fill="#0A1121")
    draw.text((40, 25), "ProofPay SaaS Showcase", fill="#FFFFFF")
    draw.text((800, 25), "Features   Pricing   How It Works   Sign In", fill="#94A3B8")
    # Hero content
    draw.rectangle([100, 150, 700, 500], fill="#1E293B", outline="#356AE6", width=2)
    draw.text((130, 190), "Work Verified. Payments Deserved.", fill="#38BDF8")
    draw.text((130, 240), "AI-Powered Milestone Payment Verification for Freelancers & Clients.", fill="#E2E8F0")
    draw.rectangle([130, 320, 280, 370], fill="#356AE6")
    draw.text((160, 335), "Get Started", fill="#FFFFFF")
    # Dashboard preview card
    draw.rectangle([740, 150, 1180, 600], fill="#0F172A", outline="#18B6A4", width=2)
    draw.text((770, 180), "Live Milestone Audit Status: 94/100", fill="#18B6A4")
    draw.rectangle([770, 220, 1140, 250], fill="#334155")
    draw.rectangle([770, 220, 1110, 250], fill="#18B6A4")
    desktop_path = os.path.join(output_dir, "screenshot_desktop_hero.png")
    desktop_img.save(desktop_path)

    # 2. Mobile Drawer Screenshot (375x812)
    mobile_img = Image.new("RGB", (375, 812), color="#0F172A")
    draw_mob = ImageDraw.Draw(mobile_img)
    draw_mob.rectangle([0, 0, 375, 60], fill="#1E293B")
    draw_mob.text((20, 20), "ProofPay Mobile", fill="#FFFFFF")
    draw_mob.rectangle([330, 22, 355, 26], fill="#38BDF8")
    draw_mob.rectangle([330, 28, 355, 32], fill="#38BDF8")
    draw_mob.rectangle([330, 34, 355, 38], fill="#38BDF8")
    # Opened mobile drawer
    draw_mob.rectangle([50, 80, 350, 450], fill="#1E293B", outline="#356AE6", width=2)
    draw_mob.text((80, 120), "Overview", fill="#FFFFFF")
    draw_mob.text((80, 170), "My Milestones", fill="#38BDF8")
    draw_mob.text((80, 220), "Payment Status", fill="#FFFFFF")
    draw_mob.text((80, 270), "AI Audit Reports", fill="#18B6A4")
    mobile_path = os.path.join(output_dir, "screenshot_mobile_drawer.png")
    mobile_img.save(mobile_path)

    return desktop_path, mobile_path

def generate_sample_code(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    
    code_path = os.path.join(output_dir, "Navbar.tsx")
    code_content = """import React, { useState } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
            <span className="font-bold text-lg tracking-tight">ProofPay Showcase</span>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
              Launch App
            </button>
          </div>
          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-slate-900/95 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <a href="#features" className="block text-slate-300 hover:text-white py-1">Features</a>
          <a href="#pricing" className="block text-slate-300 hover:text-white py-1">Pricing</a>
          <a href="#how-it-works" className="block text-slate-300 hover:text-white py-1">How It Works</a>
        </div>
      )}
    </nav>
  );
};
"""
    with open(code_path, "w", encoding="utf-8") as f:
        f.write(code_content)

    html_path = os.path.join(output_dir, "index.html")
    html_content = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="ProofPay Showcase - Verified Milestones & Secure PayPal Authorization" />
    <title>ProofPay Showcase Website</title>
  </head>
  <body class="bg-slate-950 text-slate-100">
    <div id="root"></div>
  </body>
</html>
"""
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    return code_path, html_path

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing demo data
    db.query(Notification).delete()
    db.query(PaymentEvent).delete()
    db.query(Payment).delete()
    db.query(Milestone).delete()
    db.query(ProjectRequirement).delete()
    db.query(Project).delete()
    db.query(User).delete()
    db.commit()

    print("Seeding Users...")
    # 1. Client user
    client = User(
        id="usr_client_001",
        email="client@proofpay.io",
        password_hash=get_password_hash("Password123!"),
        full_name="Sarah Jenkins",
        role="client",
        company_name="Apex Media Global",
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    )
    db.add(client)

    # 2. Freelancer user
    freelancer = User(
        id="usr_freelancer_001",
        email="freelancer@proofpay.io",
        password_hash=get_password_hash("Password123!"),
        full_name="Alex Chen",
        role="freelancer",
        company_name="Studio Chen Dev",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    )
    db.add(freelancer)
    db.commit()

    print("Seeding Project & Requirements...")
    project = Project(
        id="proj_ecommerce_demo",
        title="Modern SaaS Analytics Marketing Website",
        description="Build a high-converting, modern, fully responsive SaaS marketing website with interactive pricing calculators and PayPal-ready integration.",
        client_id=client.id,
        freelancer_id=freelancer.id,
        budget=Decimal("300.00"),
        currency="USD",
        deadline=datetime.now(timezone.utc) + timedelta(days=21),
        status="active"
    )
    db.add(project)
    db.flush()

    req1 = ProjectRequirement(
        project_id=project.id,
        title="Responsive Hero & Navigation Header with Mobile Drawer Menu",
        description="Sticky navigation with desktop links, mobile hamburger drawer, and high-impact hero banner with clear call to action.",
        category="ui_ux",
        weight=Decimal("1.00"),
        is_mandatory=True
    )
    req2 = ProjectRequirement(
        project_id=project.id,
        title="Interactive Pricing Tier Toggle (Monthly / Annual) with Plan Cards",
        description="Pricing cards with discount toggle, feature comparison list, and responsive layout scaling.",
        category="functional",
        weight=Decimal("1.00"),
        is_mandatory=True
    )
    req3 = ProjectRequirement(
        project_id=project.id,
        title="Live Demonstration URL with HTTPS Deployment and Semantic Meta Tags",
        description="Deployed accessible web URL with proper viewport configuration and SEO meta title/description tags.",
        category="performance",
        weight=Decimal("1.00"),
        is_mandatory=True
    )
    db.add_all([req1, req2, req3])
    db.commit()

    print("Seeding Milestones...")
    # Milestone 1: Ready for submission / verification & authorized
    m1 = Milestone(
        id="ms_001_landing",
        project_id=project.id,
        title="Milestone 1: Landing Page & Responsive Navigation",
        description="Design and implement the main landing page, hero section, and responsive header navigation.",
        requirements_text="- Responsive hero section with modern fintech aesthetic\n- Desktop and mobile navigation menu with sticky positioning\n- Accessible code structure and clean components",
        payment_amount=Decimal("100.00"),
        currency="USD",
        deadline=datetime.now(timezone.utc) + timedelta(days=7),
        submission_status="pending",
        ai_verification_status="not_started",
        client_approval_status="authorized",
        paypal_order_id="ORDER-DEMO-PAYPAL-9821",
        paypal_authorization_id="AUTH-DEMO-PAYPAL-7412",
        authorization_expires_at=datetime.now(timezone.utc) + timedelta(days=28)
    )

    # Milestone 2: Pending authorization
    m2 = Milestone(
        id="ms_002_pricing",
        project_id=project.id,
        title="Milestone 2: Interactive Pricing Table & FAQs",
        description="Implement dynamic pricing calculation components, currency formatting, and responsive FAQ accordion.",
        requirements_text="- Monthly vs annual billing toggle\n- Highlighted recommended plan tier\n- Clean interactive accordion for frequently asked questions",
        payment_amount=Decimal("100.00"),
        currency="USD",
        deadline=datetime.now(timezone.utc) + timedelta(days=14),
        submission_status="pending",
        ai_verification_status="not_started",
        client_approval_status="pending_authorization"
    )

    # Milestone 3: Pending authorization
    m3 = Milestone(
        id="ms_003_deploy",
        project_id=project.id,
        title="Milestone 3: Final Deployment, SEO & Live Verification",
        description="Live production deployment on edge network with Lighthouse performance score > 90 and semantic OpenGraph tags.",
        requirements_text="- Live HTTPS URL\n- Semantic meta tags & favicon\n- Cross-browser responsive verification",
        payment_amount=Decimal("100.00"),
        currency="USD",
        deadline=datetime.now(timezone.utc) + timedelta(days=21),
        submission_status="pending",
        ai_verification_status="not_started",
        client_approval_status="pending_authorization"
    )
    db.add_all([m1, m2, m3])
    db.flush()

    # Seed Payment record for Milestone 1
    payment1 = Payment(
        milestone_id=m1.id,
        client_id=client.id,
        freelancer_id=freelancer.id,
        amount=Decimal("100.00"),
        currency="USD",
        status="authorized",
        paypal_order_id=m1.paypal_order_id,
        paypal_authorization_id=m1.paypal_authorization_id,
        authorization_expires_at=m1.authorization_expires_at,
        idempotency_key="seed_payment_m1_key"
    )
    db.add(payment1)
    db.flush()

    db.add(
        PaymentEvent(
            payment_id=payment1.id,
            event_type="PAYMENT_AUTHORIZED",
            paypal_event_id=m1.paypal_authorization_id,
            payload='{"status": "AUTHORIZED", "amount": "100.00", "currency": "USD"}'
        )
    )

    # Seed Welcome Notifications
    db.add(
        Notification(
            user_id=client.id,
            title="Project Initialized",
            message=f"Project '{project.title}' is active. Milestone 1 payment of $100.00 is authorized via PayPal.",
            type="milestone_authorized",
            related_id=m1.id
        )
    )
    db.add(
        Notification(
            user_id=freelancer.id,
            title="Milestone Authorized!",
            message=f"Sarah Jenkins authorized $100.00 for '{m1.title}'. You may begin work and submit deliverables.",
            type="milestone_authorized",
            related_id=m1.id
        )
    )

    db.commit()
    db.close()

    # Generate sample assets in demo/sample_submission
    sample_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "demo", "sample_submission"))
    generate_sample_images(sample_dir)
    generate_sample_code(sample_dir)

    print("Seed complete! Created client@proofpay.io and freelancer@proofpay.io with sample project and deliverables.")

if __name__ == "__main__":
    seed_database()
