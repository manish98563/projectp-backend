from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends, Request
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import re
import jwt
import bcrypt
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'projectp-secret-key-change-in-prod')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Pydantic Models ---

class HealthResponse(BaseModel):
    status: str

class JobCreate(BaseModel):
    title: str
    location: str
    type: str = "Full-time"
    seniority: str
    description: str
    tags: List[str] = []

class JobUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    seniority: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None

class JobResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    slug: str
    title: str
    location: str
    type: str = "Full-time"
    seniority: str
    description: str
    tags: List[str]
    created_at: str
    updated_at: str

class ApplicationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    message: Optional[str] = None
    job_id: Optional[str] = None
    job_title: Optional[str] = None
    resume_path: str
    created_at: str

class AdminLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    success: bool = True
    token: str
    admin: dict = {}

class EmailLog(BaseModel):
    id: str
    to: str
    subject: str
    body: str
    sent_at: str

# --- Helper Functions ---

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text

def create_jwt_token(email: str) -> str:
    payload = {
        "sub": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_admin(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = auth_header.split(" ")[1]
    payload = verify_jwt_token(token)
    admin = await db.admins.find_one({"email": payload["sub"]}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin

# --- Rate Limiting (simple in-memory) ---
rate_limit_store = {}

def check_rate_limit(ip: str, limit: int = 10, window: int = 3600):
    now = datetime.now(timezone.utc).timestamp()
    if ip not in rate_limit_store:
        rate_limit_store[ip] = []
    rate_limit_store[ip] = [t for t in rate_limit_store[ip] if now - t < window]
    if len(rate_limit_store[ip]) >= limit:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    rate_limit_store[ip].append(now)

# --- Seed Data ---
async def seed_database():
    admin_count = await db.admins.count_documents({})
    if admin_count == 0:
        hashed = bcrypt.hashpw("ChangeMe123!".encode('utf-8'), bcrypt.gensalt(rounds=10))
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": "admin@projectpinnovations.com",
            "password": hashed.decode('utf-8'),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("Admin user seeded")

    jobs_count = await db.jobs.count_documents({})
    if jobs_count == 0:
        sample_jobs = [
            {
                "id": str(uuid.uuid4()),
                "slug": "senior-ai-engineer",
                "title": "Senior AI Engineer",
                "location": "Remote / London",
                "type": "Full-time",
                "seniority": "Senior",
                "description": "Lead the development of cutting-edge AI solutions for enterprise clients. You'll work with large language models, computer vision systems, and reinforcement learning frameworks to build products that shape the future of technology.",
                "tags": ["Python", "PyTorch", "LLMs", "MLOps"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "slug": "product-designer-ai",
                "title": "Product Designer — AI Products",
                "location": "New York, NY",
                "type": "Full-time",
                "seniority": "Mid-Level",
                "description": "Design intuitive interfaces for complex AI-powered products. Collaborate with engineers and product managers to create seamless user experiences that make AI accessible and delightful.",
                "tags": ["Figma", "UX Research", "Design Systems", "Prototyping"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "slug": "full-stack-developer",
                "title": "Full Stack Developer",
                "location": "San Francisco, CA",
                "type": "Full-time",
                "seniority": "Junior",
                "description": "Build and maintain web applications that power our AI platform. Work across the stack with React, Node.js, and cloud infrastructure to deliver scalable, high-performance solutions.",
                "tags": ["React", "Node.js", "TypeScript", "AWS"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "slug": "ml-ops-engineer",
                "title": "MLOps Engineer",
                "location": "Remote",
                "type": "Full-time",
                "seniority": "Mid-Level",
                "description": "Design and manage ML infrastructure and deployment pipelines. Ensure model reliability, monitoring, and scalability in production environments across cloud platforms.",
                "tags": ["Kubernetes", "Docker", "CI/CD", "AWS", "Terraform"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "slug": "data-scientist",
                "title": "Data Scientist",
                "location": "London, UK",
                "type": "Contract",
                "seniority": "Senior",
                "description": "Extract insights from complex datasets and build predictive models. Work closely with stakeholders to drive data-informed decisions and develop innovative analytics solutions.",
                "tags": ["Python", "SQL", "Statistics", "Tableau"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "slug": "ai-research-intern",
                "title": "AI Research Intern",
                "location": "Remote",
                "type": "Internship",
                "seniority": "Junior",
                "description": "Support the research team in exploring new AI methodologies. Conduct literature reviews, prototype models, and contribute to published research papers.",
                "tags": ["Python", "Research", "NLP", "Computer Vision"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.jobs.insert_many(sample_jobs)
        logger.info("Sample jobs seeded")

# --- Public Routes ---

@api_router.get("/health", response_model=HealthResponse)
async def health_check():
    return {"status": "ok"}

@api_router.get("/jobs", response_model=List[JobResponse])
async def get_jobs():
    jobs = await db.jobs.find({}, {"_id": 0}).to_list(100)
    return jobs

@api_router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        job = await db.jobs.find_one({"slug": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@api_router.post("/apply", status_code=201)
async def submit_application(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(None),
    job_id: str = Form(None),
    resume: UploadFile = File(...)
):
    client_ip = request.client.host
    check_rate_limit(client_ip)

    # Validate file extension
    ext = Path(resume.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    # Read and validate file size
    content = await resume.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")

    # Save file with UUID name
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{ext}"
    filepath = UPLOAD_DIR / filename
    with open(filepath, "wb") as f:
        f.write(content)

    # Get job title if job_id provided
    job_title = None
    if job_id:
        job = await db.jobs.find_one({"id": job_id}, {"_id": 0, "title": 1})
        if job:
            job_title = job.get("title")

    # Create application
    application = {
        "id": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "message": message,
        "job_id": job_id,
        "job_title": job_title,
        "resume_path": filename,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.applications.insert_one(application)

    # Mock email - log and store
    subject = f"New Application: {name} — {job_title or 'General'}"
    email_body = f"""
New application received:
- Name: {name}
- Email: {email}
- Position: {job_title or 'General Application'}
- Message: {message or 'N/A'}
- Resume: {filename}
"""
    email_log = {
        "id": str(uuid.uuid4()),
        "to": "vishalpala@projectpinnovations.com",
        "subject": subject,
        "body": email_body.strip(),
        "sent_at": datetime.now(timezone.utc).isoformat()
    }
    await db.email_logs.insert_one(email_log)
    logger.info(f"[MOCK EMAIL] To: vishalpala@projectpinnovations.com | Subject: {subject}")
    logger.info(f"[MOCK EMAIL] Body:\n{email_body}")

    return {"message": "Application submitted successfully", "id": application["id"]}

@api_router.get("/test-email")
async def test_email():
    email_log = {
        "id": str(uuid.uuid4()),
        "to": "vishalpala@projectpinnovations.com",
        "subject": "Test Email from Project P Innovations",
        "body": "This is a test email to verify the email system is working.",
        "sent_at": datetime.now(timezone.utc).isoformat()
    }
    await db.email_logs.insert_one(email_log)
    logger.info("[MOCK EMAIL] Test email sent successfully")
    return {"message": "Test email sent (mocked)", "email_log_id": email_log["id"]}

# --- Admin Routes ---

@api_router.post("/admin/login", response_model=TokenResponse)
async def admin_login(creds: AdminLogin):
    admin = await db.admins.find_one({"email": creds.email}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not bcrypt.checkpw(creds.password.encode('utf-8'), admin["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_jwt_token(admin["email"])
    return {
        "success": True,
        "token": token,
        "admin": {"id": admin.get("id", ""), "email": admin["email"]}
    }

@api_router.get("/admin/applications", response_model=List[ApplicationResponse])
async def get_applications(admin=Depends(get_current_admin)):
    applications = await db.applications.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return applications

@api_router.get("/admin/email-logs", response_model=List[EmailLog])
async def get_email_logs(admin=Depends(get_current_admin)):
    logs = await db.email_logs.find({}, {"_id": 0}).sort("sent_at", -1).to_list(100)
    return logs

@api_router.post("/admin/jobs", response_model=JobResponse, status_code=201)
async def create_job(job_data: JobCreate, admin=Depends(get_current_admin)):
    now = datetime.now(timezone.utc).isoformat()
    job = {
        "id": str(uuid.uuid4()),
        "slug": slugify(job_data.title),
        "title": job_data.title,
        "location": job_data.location,
        "type": job_data.type,
        "seniority": job_data.seniority,
        "description": job_data.description,
        "tags": job_data.tags,
        "created_at": now,
        "updated_at": now
    }
    await db.jobs.insert_one(job)
    job.pop("_id", None)
    return job

@api_router.put("/admin/jobs/{job_id}", response_model=JobResponse)
async def update_job(job_id: str, job_data: JobUpdate, admin=Depends(get_current_admin)):
    existing = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Job not found")
    update_fields = {k: v for k, v in job_data.model_dump().items() if v is not None}
    if "title" in update_fields:
        update_fields["slug"] = slugify(update_fields["title"])
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.jobs.update_one({"id": job_id}, {"$set": update_fields})
    updated = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/jobs/{job_id}", status_code=204)
async def delete_job(job_id: str, admin=Depends(get_current_admin)):
    result = await db.jobs.delete_one({"id": job_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return None

@api_router.get("/admin/download-resume/{filename}")
async def download_resume(filename: str, admin=Depends(get_current_admin)):
    filepath = UPLOAD_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath, filename=filename)

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await seed_database()
    logger.info("Project P Innovations API started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
