import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.hash import bcrypt
from datetime import datetime
import os
import uuid

async def seed_production():
    MONGO_URL = os.getenv("MONGO_URL")
    DB_NAME = os.getenv("DB_NAME", "projectp_db")

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    print("🌱 Seeding production database...")

    admin_email = "admin@projectpinnovations.com"
    admin_password = "SecurePass2024!"

    existing_admin = await db.admins.find_one({"email": admin_email})

    if not existing_admin:
        hashed = bcrypt.hash(admin_password)
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password": hashed,
            "created_at": datetime.utcnow().isoformat()
        })
        print("✅ Admin created")
        print(f"📧 {admin_email}")
        print(f"🔑 {admin_password}")
    else:
        print("⚠️ Admin already exists")

    sample_jobs = [
        {
            "id": str(uuid.uuid4()),
            "title": "Senior AI Engineer",
            "slug": "senior-ai-engineer",
            "type": "Full-time",
            "location": "Remote / London",
            "seniority": "Senior",
            "description": "Enterprise AI systems role.",
            "tags": ["Python", "TensorFlow", "NLP"],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "ML Research Scientist",
            "slug": "ml-research-scientist",
            "type": "Full-time",
            "location": "Hybrid / San Francisco",
            "seniority": "Mid-level",
            "description": "Research-focused ML role.",
            "tags": ["PyTorch", "CV"],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    ]

    for job in sample_jobs:
        exists = await db.jobs.find_one({"slug": job["slug"]})
        if not exists:
            await db.jobs.insert_one(job)
            print(f"✅ Job created: {job['title']}")
        else:
            print(f"⚠️ Job exists: {job['title']}")

    print("🎉 Production database seeded")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_production())
