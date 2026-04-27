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
ADDRESSES = ["Andheri West, Mumbai", "Bandra East, Mumbai", "Dadar, Mumbai", "Juhu, Mumbai", "Powai, Mumbai", "Malad West, Mumbai", "Goregaon East, Mumbai", "Borivali West, Mumbai", "Thane West, Thane", "Vashi, Navi Mumbai", "Kurla East, Mumbai", "Chembur, Mumbai", "Ghatkopar West, Mumbai", "Vikhroli East, Mumbai", "Mulund West, Mumbai", "Kalyan West, Kalyan", "Panvel, Navi Mumbai", "Dombivli East, Dombivli", "Airoli, Navi Mumbai", "Kharghar, Navi Mumbai"]
GUJARAT_ADDRESSES = ["Alkapuri, Vadodara", "Fatehgunj, Vadodara", "Sayajigunj, Vadodara", "Maninagar, Ahmedabad", "Navrangpura, Ahmedabad", "Satellite, Ahmedabad", "Isanpur, Ahmedabad", "Adajan, Surat", "Varachha, Surat", "Kalavad Road, Rajkot", "Gandhinagar Sector 21", "Waghawadi Road, Bhavnagar"]

def seed_database():
    db = SessionLocal()
    try:
        # Check if already seeded (more than 2 needs, which is what we have currently)
        if db.query(Need).count() > 5:
            print("Database already fully seeded. Skipping...")
            return

        print("Clearing existing data for a fresh full seed...")
        db.query(Assignment).delete()
        db.query(Need).delete()
        db.query(Volunteer).delete()
        db.query(Broadcast).delete()
        db.query(User).delete()
        db.commit()

        print("Seeding database with ALL demo data...")
        
        # Admin
        admin_user = User(id=_uuid(), email="admin@smartalloc.org", name="Priya Sharma (Admin)", role="admin", google_id="google_admin_demo_001", created_at=_random_past(30))
        db.add(admin_user)

        # Volunteer Names
        volunteer_names = [("Rahul Verma", "rahul.verma@email.com"), ("Anita Desai", "anita.desai@email.com"), ("Suresh Kumar", "suresh.kumar@email.com"), ("Meena Patel", "meena.patel@email.com"), ("Arjun Singh", "arjun.singh@email.com"), ("Kavita Reddy", "kavita.reddy@email.com"), ("Rohan Mehta", "rohan.mehta@email.com"), ("Sneha Joshi", "sneha.joshi@email.com"), ("Vikram Rao", "vikram.rao@email.com"), ("Pooja Gupta", "pooja.gupta@email.com"), ("Amit Tiwari", "amit.tiwari@email.com"), ("Deepa Nair", "deepa.nair@email.com")]
        gujarat_volunteer_names = [("Hardik Patel", "hardik.patel@email.com"), ("Nisha Shah", "nisha.shah@email.com"), ("Kiran Bhatt", "kiran.bhatt@email.com"), ("Darshan Modi", "darshan.modi@email.com"), ("Riya Desai", "riya.desai@email.com"), ("Yash Trivedi", "yash.trivedi@email.com")]

        volunteers = []
        for i, (name, email) in enumerate(volunteer_names):
            u = User(id=_uuid(), email=email, name=name, role="volunteer", created_at=_random_past(20))
            db.add(u)
            db.flush()
            lat, lon = _mumbai_coords()
            vol = Volunteer(id=_uuid(), user_id=u.id, phone=f"+91-9{random.randint(100000000, 999999999)}", skills=json.dumps(random.sample(SKILLS_POOL, 3)), latitude=lat, longitude=lon, address=random.choice(ADDRESSES), availability="available", tasks_completed=random.randint(0, 25), rating=round(random.uniform(3.0, 5.0), 1))
            db.add(vol)
            volunteers.append(vol)

        for i, (name, email) in enumerate(gujarat_volunteer_names):
            u = User(id=_uuid(), email=email, name=name, role="volunteer", created_at=_random_past(20))
            db.add(u)
            db.flush()
            lat, lon = _gujarat_coords()
            vol = Volunteer(id=_uuid(), user_id=u.id, phone=f"+91-9{random.randint(100000000, 999999999)}", skills=json.dumps(random.sample(SKILLS_POOL, 3)), latitude=lat, longitude=lon, address=random.choice(GUJARAT_ADDRESSES), availability="available", tasks_completed=random.randint(0, 20), rating=round(random.uniform(3.0, 5.0), 1))
            db.add(vol)
            volunteers.append(vol)

        # Needs
        needs_data = [
            ("5 elderly with fever in Gokuldham", "Need medical checkup and medicine delivery.", "medical", 5, 8),
            ("Food packets needed in Dharavi", "200 families displaced by waterlogging.", "food", 5, 200),
            ("Temporary shelter in Kurla", "Need temporary tents and blankets.", "shelter", 4, 120),
            ("Clean water supply in Malad", "Need bottled water distribution.", "water", 5, 500),
            ("Flood rescue in Sion", "Need boats and rescue team.", "rescue", 5, 15),
            ("Children tutoring in Andheri", "After-school tutoring support.", "education", 2, 50),
            ("Winter clothing drive in Thane", "Street children and homeless need warm clothing.", "clothing", 3, 80),
            ("Sanitation cleanup in Chembur slum", "Need volunteers for cleanup drive.", "sanitation", 4, 300),
            ("Medical camp needed in Powai", "Senior citizens community requesting health checkup.", "medical", 3, 45),
            ("Food distribution at Borivali station", "Meal distribution near railway station.", "food", 3, 100),
        ]
        
        gujarat_needs_data = [
            ("Medical camp at Vadodara slum", "Free health checkup needed for 100+ families.", "medical", 3, 100, "Tandalja, Vadodara"),
            ("Food distribution in Ahmedabad", "150 families need food packets.", "food", 5, 150, "Sabarmati, Ahmedabad"),
            ("Clean water needed in Surat", "Contaminated water supply in textile zone.", "water", 4, 200, "Pandesara, Surat"),
            ("Shelter for displaced families in Rajkot", "20 families displaced due to heavy rains.", "shelter", 4, 80, "Aji Dam Area, Rajkot"),
        ]

        all_needs = []
        statuses = ["open", "open", "assigned", "in_progress", "resolved"]
        for i, (title, desc, cat, urgency, affected) in enumerate(needs_data):
            lat, lon = _mumbai_coords()
            status_val = statuses[i % len(statuses)]
            need = Need(id=_uuid(), reported_by=admin_user.id, title=title, description=desc, category=cat, urgency=urgency, status=status_val, latitude=lat, longitude=lon, address=random.choice(ADDRESSES), people_affected=affected, created_at=_random_past(10))
            if status_val == "resolved": need.resolved_at = need.created_at + timedelta(hours=24)
            db.add(need)
            all_needs.append(need)

        for i, (title, desc, cat, urgency, affected, addr) in enumerate(gujarat_needs_data):
            lat, lon = _gujarat_coords()
            status_val = statuses[i % len(statuses)]
            need = Need(id=_uuid(), reported_by=admin_user.id, title=title, description=desc, category=cat, urgency=urgency, status=status_val, latitude=lat, longitude=lon, address=addr, people_affected=affected, created_at=_random_past(10))
            if status_val == "resolved": need.resolved_at = need.created_at + timedelta(hours=24)
            db.add(need)
            all_needs.append(need)

        # Assignments
        db.flush()
        assigned_needs = [n for n in all_needs if n.status in ("assigned", "in_progress", "resolved")]
        for need in assigned_needs:
            vol = random.choice(volunteers)
            assignment = Assignment(id=_uuid(), need_id=need.id, volunteer_id=vol.id, status=need.status if need.status != "open" else "assigned", match_score=round(random.uniform(50, 95), 2), distance_km=round(random.uniform(0.5, 15), 2), assigned_at=need.created_at + timedelta(minutes=30))
            need.assigned_volunteer_id = vol.id
            db.add(assignment)

        db.commit()
        print(f"Full Seed complete! Added {len(volunteers)} Volunteers and {len(all_needs)} Needs.")
    except Exception as e:
        db.rollback()
        print(f"Full Seed failed: {e}")
    finally:
        db.close()
