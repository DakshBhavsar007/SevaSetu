import json
import uuid
import random
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from .database import SessionLocal, init_db
from .models import User, Volunteer, Need, Assignment, Broadcast

def _uuid():
    return str(uuid.uuid4())

def _random_past(days_max=14):
    return datetime.now(timezone.utc) - timedelta(
        days=random.randint(0, days_max),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
    )

def _mumbai_coords():
    return (
        19.0760 + random.uniform(-0.08, 0.08),
        72.8777 + random.uniform(-0.08, 0.08),
    )

def _gujarat_coords():
    cities = [
        (22.3072, 73.1812), (23.0225, 72.5714), (21.1702, 72.8311),
        (22.3039, 70.8022), (21.7645, 72.1519), (23.2156, 72.6369),
    ]
    base_lat, base_lon = random.choice(cities)
    return (
        base_lat + random.uniform(-0.03, 0.03),
        base_lon + random.uniform(-0.03, 0.03),
    )

SKILLS_POOL = ["medical", "first_aid", "nursing", "cooking", "driving", "logistics", "construction", "teaching", "counseling", "swimming", "cleaning", "it_support", "translation", "childcare", "elderly_care", "mental_health"]
ADDRESSES = ["Andheri West, Mumbai", "Bandra East, Mumbai", "Dadar, Mumbai", "Juhu, Mumbai", "Powai, Mumbai", "Malad West, Mumbai", "Goregaon East, Mumbai", "Borivali West, Mumbai", "Thane West, Thane", "Vashi, Navi Mumbai"]
GUJARAT_ADDRESSES = ["Alkapuri, Vadodara", "Fatehgunj, Vadodara", "Sayajigunj, Vadodara", "Maninagar, Ahmedabad", "Navrangpura, Ahmedabad", "Satellite, Ahmedabad", "Isanpur, Ahmedabad", "Adajan, Surat"]

def seed_database():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@smartalloc.org").first():
            print("Database already seeded. Skipping...")
            return

        print("Clearing existing data...")
        db.query(Assignment).delete()
        db.query(Need).delete()
        db.query(Volunteer).delete()
        db.query(Broadcast).delete()
        db.query(User).delete()
        db.commit()

        print("Seeding database with fresh demo data...")
        
        # Admin
        admin_user = User(id=_uuid(), email="admin@smartalloc.org", name="Priya Sharma (Admin)", role="admin", google_id="google_admin_demo_001", created_at=_random_past(30))
        db.add(admin_user)

        # Volunteers
        vnames = [("Rahul Verma", "rahul.verma@email.com"), ("Anita Desai", "anita.desai@email.com"), ("Suresh Kumar", "suresh.kumar@email.com")]
        for name, email in vnames:
            u = User(id=_uuid(), email=email, name=name, role="volunteer", created_at=_random_past(20))
            db.add(u)
            db.flush()
            lat, lon = _mumbai_coords()
            vol = Volunteer(id=_uuid(), user_id=u.id, phone="+91-9999999999", skills=json.dumps(random.sample(SKILLS_POOL, 3)), latitude=lat, longitude=lon, address=random.choice(ADDRESSES), availability="available")
            db.add(vol)

        # Needs
        needs_data = [("Emergency Food Supply", "Food packets needed for 50 people.", "food", 5, 50), ("Medical Assistance", "First aid and fever medicine needed.", "medical", 4, 10)]
        for title, desc, cat, urgency, affected in needs_data:
            lat, lon = _mumbai_coords()
            need = Need(id=_uuid(), reported_by=admin_user.id, title=title, description=desc, category=cat, urgency=urgency, status="open", latitude=lat, longitude=lon, address=random.choice(ADDRESSES), people_affected=affected, created_at=_random_past(5))
            db.add(need)

        db.commit()
        print("Seed complete!")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
    finally:
        db.close()
