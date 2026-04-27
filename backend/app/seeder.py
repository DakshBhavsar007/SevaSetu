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
    return (19.0760 + random.uniform(-0.08, 0.08), 72.8777 + random.uniform(-0.08, 0.08))

def _gujarat_coords():
    cities = [(22.3072, 73.1812), (23.0225, 72.5714), (21.1702, 72.8311), (22.3039, 70.8022), (21.7645, 72.1519), (23.2156, 72.6369)]
    base_lat, base_lon = random.choice(cities)
    return (base_lat + random.uniform(-0.03, 0.03), base_lon + random.uniform(-0.03, 0.03))

SKILLS_POOL = ["medical", "first_aid", "nursing", "cooking", "driving", "logistics", "construction", "teaching", "counseling", "swimming", "cleaning", "it_support", "translation", "childcare", "elderly_care", "mental_health"]
ADDRESSES = ["Andheri West, Mumbai", "Bandra East, Mumbai", "Dadar, Mumbai", "Juhu, Mumbai", "Powai, Mumbai", "Malad West, Mumbai", "Goregaon East, Mumbai", "Borivali West, Mumbai", "Thane West, Thane", "Vashi, Navi Mumbai", "Kurla East, Mumbai", "Chembur, Mumbai", "Ghatkopar West, Mumbai", "Vikhroli East, Mumbai", "Mulund West, Mumbai"]
GUJARAT_ADDRESSES = ["Alkapuri, Vadodara", "Fatehgunj, Vadodara", "Sayajigunj, Vadodara", "Maninagar, Ahmedabad", "Navrangpura, Ahmedabad", "Satellite, Ahmedabad", "Isanpur, Ahmedabad", "Adajan, Surat", "Varachha, Surat", "Kalavad Road, Rajkot"]

def seed_database():
    db = SessionLocal()
    try:
        # Check if already seeded (more than 5 needs)
        if db.query(Need).count() > 5:
            print("Database already has enough data. Skipping full seed...")
            return

        print("Clearing existing minimal data for full seed...")
        db.query(Assignment).delete()
        db.query(Need).delete()
        db.query(Volunteer).delete()
        db.query(Broadcast).delete()
        db.query(User).delete()
        db.commit()

        print("Seeding database with FULL demo data...")
        
        # Admin
        admin_user = User(id=_uuid(), email="admin@smartalloc.org", name="Priya Sharma (Admin)", role="admin", google_id="google_admin_demo_001", created_at=_random_past(30))
        db.add(admin_user)

        # Volunteers (Mumbai + Gujarat)
        vol_names = [("Rahul Verma", "rahul.verma@email.com"), ("Anita Desai", "anita.desai@email.com"), ("Suresh Kumar", "suresh.kumar@email.com"), ("Meena Patel", "meena.patel@email.com"), ("Arjun Singh", "arjun.singh@email.com"), ("Kavita Reddy", "kavita.reddy@email.com"), ("Hardik Patel", "hardik.patel@email.com"), ("Nisha Shah", "nisha.shah@email.com"), ("Kiran Bhatt", "kiran.bhatt@email.com")]
        
        volunteers = []
        for name, email in vol_names:
            is_gj = "Patel" in name or "Shah" in name or "Bhatt" in name
            u = User(id=_uuid(), email=email, name=name, role="volunteer", created_at=_random_past(20))
            db.add(u)
            db.flush()
            lat, lon = _gujarat_coords() if is_gj else _mumbai_coords()
            vol = Volunteer(id=_uuid(), user_id=u.id, phone=f"+91-9{random.randint(100000000, 999999999)}", skills=json.dumps(random.sample(SKILLS_POOL, 3)), latitude=lat, longitude=lon, address=random.choice(GUJARAT_ADDRESSES if is_gj else ADDRESSES), availability="available", tasks_completed=random.randint(5, 20), rating=round(random.uniform(4.0, 5.0), 1))
            db.add(vol)
            volunteers.append(vol)

        # Needs
        needs_list = [
            ("5 elderly with fever in Gokuldham", "Need medical checkup and medicine delivery.", "medical", 5, 8),
            ("Food packets needed in Dharavi", "200 families displaced by waterlogging.", "food", 5, 200),
            ("Temporary shelter in Kurla", "Need temporary tents and blankets.", "shelter", 4, 120),
            ("Clean water supply in Malad", "Need bottled water distribution.", "water", 5, 500),
            ("Flood rescue in Sion", "Need boats and rescue team.", "rescue", 5, 15),
            ("Children tutoring in Andheri", "After-school tutoring support.", "education", 2, 50),
            ("Winter clothing drive in Thane", "Need warm clothing for winter.", "clothing", 3, 80),
            ("Medical camp at Vadodara slum", "Free health checkup needed.", "medical", 3, 100),
            ("Clean water needed in Surat", "Workers reporting contaminated water.", "water", 4, 200)
        ]
        
        all_needs = []
        for title, desc, cat, urgency, affected in needs_list:
            is_gj = "Vadodara" in title or "Surat" in title
            lat, lon = _gujarat_coords() if is_gj else _mumbai_coords()
            need = Need(id=_uuid(), reported_by=admin_user.id, title=title, description=desc, category=cat, urgency=urgency, status="open", latitude=lat, longitude=lon, address=random.choice(GUJARAT_ADDRESSES if is_gj else ADDRESSES), people_affected=affected, created_at=_random_past(10))
            db.add(need)
            all_needs.append(need)

        # Assignments
        db.flush()
        for i, need in enumerate(all_needs[:5]):
            need.status = "assigned"
            vol = volunteers[i % len(volunteers)]
            need.assigned_volunteer_id = vol.id
            assignment = Assignment(id=_uuid(), need_id=need.id, volunteer_id=vol.id, status="assigned", match_score=round(random.uniform(70, 95), 2), assigned_at=need.created_at + timedelta(hours=1))
            db.add(assignment)

        db.commit()
        print(f"Full Seed complete! Added {len(volunteers)} volunteers and {len(all_needs)} needs.")
    except Exception as e:
        db.rollback()
        print(f"Full Seed failed: {e}")
    finally:
        db.close()
