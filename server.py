"""
Project P Innovations - FastAPI Backend Server
Complete API for job applications, admin management, and email notifications
"""

from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import os
import logging
import uuid
import re
import jwt
import bcrypt
import resend

# ============================================================================
# CONFIGURATION & SETUP
# ============================================================================

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB Configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'projectp-secret-key-change-in-prod')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Email Configuration (Resend)
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
resend.api_key = RESEND_API_KEY
EMAIL_FROM = os.environ.get('EMAIL_FROM', 'vishalpala@projectpinnovations.com')
EMAIL_TO = os.environ.get('EMAIL_TO', 'vishalpala@projectpinnovations.com')

# File Upload Configuration
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# CORS Origins
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class HealthResponse(BaseModel):
    """Health check response"""
    status: str

class JobCreate(BaseModel):
    """Job creation model"""
    title: str
    location: str
    type: str = "Full-time"
    seniority: str
    description: str
    tags: List[str] = []

class JobUpdate(BaseModel):
    """Job update model (all fields optional)"""
    title: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    seniority: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None

class JobResponse(BaseModel):
    """Job response model"""
    model_config = ConfigDict(extra="ignore")
    id: str
    slug: str
    title: str
    location: str
    type: str
    seniority: str
    description: str
    tags: List[str]
    created_at: str
    updated_at: str

class ApplicationResponse(BaseModel):
    """Application response model"""
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
    """Admin login credentials"""
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    """JWT token response"""
    success: bool = True
    token: str
    admin: dict

class EmailLog(BaseModel):
    """Email log model"""
    id: str
    to: str
    subject: str
    body: str
    sent_at: str
    status: str = "sent"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def slugify(text: str) -> str:
    """
    Convert text to URL-friendly slug
    
    Args:
        text: Text to convert
    
    Returns:
        URL-safe slug string
    """
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text

def create_jwt_token(email: str) -> str:
    """
    Create JWT token for admin authentication
    
    Args:
        email: Admin email address
    
    Returns:
        Encoded JWT token string
    """
    payload = {
        "sub": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> dict:
    """
    Verify and decode JWT token
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded token payload
    
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_admin(request: Request):
    """
    Dependency to get current authenticated admin
    
    Args:
        request: FastAPI request object
    
    Returns:
        Admin document from database
    
    Raises:
        HTTPException: If authentication fails
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )
    
    token = auth_header.split(" ")[1]
    payload = verify_jwt_token(token)
    
    admin = await db.admins.find_one({"email": payload["sub"]}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    return admin

async def send_email(to: str, subject: str, html_body: str) -> dict:
    """
    Send email via Resend and log to database
    
    Args:
        to: Recipient email address
        subject: Email subject line
        html_body: HTML email body
    
    Returns:
        Dictionary with success status and email log ID
    """
    try:
        # Send via Resend
        params = {
            "from": EMAIL_FROM,
            "to": [to],
            "subject": subject,
            "html": html_body
        }
        resend_response = resend.Emails.send(params)
        
        # Log to database
        email_log = {
            "id": str(uuid.uuid4()),
            "to": to,
            "subject": subject,
            "body": html_body,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "resend_id": resend_response.get('id', ''),
            "status": "sent"
        }
        await db.email_logs.insert_one(email_log)
        
        logger.info(f"✅ Email sent to {to} | Subject: {subject}")
        
        return {
            "success": True,
            "email_log_id": email_log["id"],
            "resend_id": resend_response.get('id', '')
        }
        
    except Exception as e:
        logger.error(f"❌ Email failed: {str(e)}")
        
        # Log failure
        email_log = {
            "id": str(uuid.uuid4()),
            "to": to,
            "subject": subject,
            "body": html_body,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "status": "failed",
            "error": str(e)
        }
        await db.email_logs.insert_one(email_log)
        
        return {
            "success": False,
            "error": str(e),
            "email_log_id": email_log["id"]
        }

# ============================================================================
# RATE LIMITING
# ============================================================================

rate_limit_store = {}

def check_rate_limit(ip: str, limit: int = 10, window: int = 3600):
    """
    Simple in-memory rate limiting
    
    Args:
        ip: Client IP address
        limit: Maximum requests allowed
        window: Time window in seconds
    
    Raises:
        HTTPException: If rate limit exceeded
    """
    now = datetime.now(timezone.utc).timestamp()
    
    if ip not in rate_limit_store:
        rate_limit_store[ip] = []
    
    # Remove expired timestamps
    rate_limit_store[ip] = [
        t for t in rate_limit_store[ip]
        if now - t < window
    ]
    
    if len(rate_limit_store[ip]) >= limit:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )
    
    rate_limit_store[ip].append(now)

# ============================================================================
# DATABASE SEEDING
# ============================================================================

async def seed_database():
    """Seed database with initial admin user and sample jobs"""
    
    # Create admin user
    admin_count = await db.admins.count_documents({})
    if admin_count == 0:
        hashed_password = bcrypt.hashpw(
            "ChangeMe123!".encode('utf-8'),
            bcrypt.gensalt(rounds=10)
        )
        
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": "admin@projectpinnovations.com",
            "password": hashed_password.decode('utf-8'),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("✅ Admin user seeded: admin@projectpinnovations.com")
    
    # Create sample jobs
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
                "description": "Lead the development of cutting-edge AI solutions for enterprise clients. Work with LLMs, computer vision, and reinforcement learning to build products that shape the future.",
                "tags": ["Python", "PyTorch", "LLMs", "MLOps"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "slug": "ml-research-scientist",
                "title": "ML Research Scientist",
                "location": "Hybrid / San Francisco",
                "type": "Full-time",
                "seniority": "Mid-Level",
                "description": "Join our research team to develop novel algorithms and contribute to groundbreaking AI research in computer vision and reinforcement learning.",
                "tags": ["PyTorch", "Computer Vision", "Research", "PhD"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "slug": "ai-product-manager",
                "title": "AI Product Manager",
                "location": "Remote",
                "type": "Full-time",
                "seniority": "Senior",
                "description": "Lead product strategy and roadmap for our AI-powered automation platform. Work closely with engineering and design teams.",
                "tags": ["Product Strategy", "AI/ML", "Agile", "B2B SaaS"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "slug": "data-engineer",
                "title": "Data Engineer",
                "location": "Remote / Bangalore",
                "type": "Full-time",
                "seniority": "Mid-Level",
                "description": "Build and maintain scalable data pipelines and infrastructure to support our machine learning models and analytics platform.",
                "tags": ["Python", "SQL", "Airflow", "Spark"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "slug": "ai-solutions-architect",
                "title": "AI Solutions Architect",
                "location": "Hybrid / London",
                "type": "Contract",
                "seniority": "Senior",
                "description": "Design and implement AI solutions for enterprise clients. Translate business requirements into technical architectures.",
                "tags": ["Solution Design", "Cloud", "Client-facing", "Architecture"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "slug": "junior-ml-engineer",
                "title": "Junior ML Engineer",
                "location": "Remote",
                "type": "Full-time",
                "seniority": "Junior",
                "description": "Start your career in AI by supporting our ML engineering team in developing and deploying machine learning models.",
                "tags": ["Python", "Scikit-learn", "Git", "Learning"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        
        await db.jobs.insert_many(sample_jobs)
        logger.info("✅ Sample jobs seeded")

# ============================================================================
# FASTAPI APP & ROUTER
# ============================================================================

app = FastAPI(
    title="Project P Innovations API",
    description="Backend API for job applications and admin management",
    version="1.0.0"
)

api_router = APIRouter(prefix="/api")

# ============================================================================
# PUBLIC ROUTES
# ============================================================================

@api_router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@api_router.get("/jobs", response_model=List[JobResponse])
async def get_jobs(limit: int = 100):
    """
    Get all job listings
    
    Args:
        limit: Maximum number of jobs to return (default: 100)
    
    Returns:
        List of job postings
    """
    jobs = await db.jobs.find({}, {"_id": 0}).to_list(limit)
    return jobs

@api_router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    """
    Get a specific job by ID or slug
    
    Args:
        job_id: Job ID or slug
    
    Returns:
        Job posting details
    
    Raises:
        HTTPException: If job not found
    """
    # Try finding by ID first
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    
    # If not found, try by slug
    if not job:
        job = await db.jobs.find_one({"slug": job_id}, {"_id": 0})
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

@api_router.post("/apply", status_code=201)
async def submit_application(
    request: Request,
    name: str = Form(..., min_length=2, max_length=100),
    email: str = Form(...),
    message: str = Form(None, max_length=1000),
    job_id: str = Form(None),
    resume: UploadFile = File(...)
):
    """
    Submit a job application
    
    Args:
        request: FastAPI request object
        name: Applicant name
        email: Applicant email
        message: Optional application message
        job_id: Optional job ID
        resume: Resume file (PDF, DOC, DOCX)
    
    Returns:
        Success message with application ID
    
    Raises:
        HTTPException: If validation fails or rate limit exceeded
    """
    # Rate limiting
    client_ip = request.client.host
    check_rate_limit(client_ip)
    
    # Validate file extension
    file_ext = Path(resume.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validate file size
    content = await resume.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 5MB limit"
        )
    
    # Save file with UUID name
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    filepath = UPLOAD_DIR / filename
    
    with open(filepath, "wb") as f:
        f.write(content)
    
    logger.info(f"✅ Resume saved: {filename}")
    
    # Get job title if job_id provided
    job_title = None
    if job_id:
        job = await db.jobs.find_one({"id": job_id}, {"_id": 0, "title": 1})
        if job:
            job_title = job.get("title")
    
    # Create application record
    application_id = str(uuid.uuid4())
    application = {
        "id": application_id,
        "name": name,
        "email": email,
        "message": message,
        "job_id": job_id,
        "job_title": job_title,
        "resume_path": filename,
        "original_filename": resume.filename,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.applications.insert_one(application)
    logger.info(f"✅ Application created: {application_id}")
    
    # Send email notification
    subject = f"New Application: {name} — {job_title or 'General'}"
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #071020, #0a1628); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
            .info-row {{ margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #FF7A2A; }}
            .label {{ font-weight: bold; color: #071020; }}
            .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 New Job Application</h1>
            </div>
            <div class="content">
                <div class="info-row">
                    <span class="label">Name:</span> {name}
                </div>
                <div class="info-row">
                    <span class="label">Email:</span> {email}
                </div>
                <div class="info-row">
                    <span class="label">Position:</span> {job_title or 'General Application'}
                </div>
                <div class="info-row">
                    <span class="label">Message:</span><br>
                    {message or 'No message provided'}
                </div>
                <div class="info-row">
                    <span class="label">Resume:</span> {resume.filename}
                </div>
                <div class="footer">
                    <p>Login to the admin dashboard to download the resume and review the application.</p>
                    <p>Project P Innovations - AI Solutions & Consulting</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    await send_email(EMAIL_TO, subject, html_body)
    
    return {
        "success": True,
        "message": "Application submitted successfully",
        "id": application_id
    }

@api_router.get("/test-email")
async def test_email_endpoint():
    """
    Test email functionality
    
    Returns:
        Success message with email log ID
    """
    subject = "✅ Test Email - Project P Innovations"
    html_body = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 8px; }
            h1 { color: #071020; }
            .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Test Email</h1>
            <div class="success">
                <strong>Success!</strong> Your email system is working correctly.
            </div>
            <p>This is a test email to verify the Resend integration.</p>
            <p>If you're seeing this, everything is configured properly! ✅</p>
        </div>
    </body>
    </html>
    """
    
    result = await send_email(EMAIL_TO, subject, html_body)
    
    if result["success"]:
        return {
            "success": True,
            "message": "Test email sent successfully",
            "email_log_id": result["email_log_id"],
            "resend_id": result.get("resend_id", "")
        }
    else:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email: {result.get('error', 'Unknown error')}"
        )

# ============================================================================
# ADMIN ROUTES
# ============================================================================

@api_router.post("/admin/login", response_model=TokenResponse)
async def admin_login(credentials: AdminLogin):
    """
    Admin login endpoint
    
    Args:
        credentials: Admin email and password
    
    Returns:
        JWT token and admin info
    
    Raises:
        HTTPException: If credentials are invalid
    """
    admin = await db.admins.find_one({"email": credentials.email}, {"_id": 0})
    
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not bcrypt.checkpw(
        credentials.password.encode('utf-8'),
        admin["password"].encode('utf-8')
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    token = create_jwt_token(admin["email"])
    
    logger.info(f"✅ Admin logged in: {admin['email']}")
    
    return {
        "success": True,
        "token": token,
        "admin": {
            "id": admin.get("id", ""),
            "email": admin["email"]
        }
    }

@api_router.get("/admin/applications", response_model=List[ApplicationResponse])
async def get_applications(admin=Depends(get_current_admin)):
    """
    Get all job applications (admin only)
    
    Args:
        admin: Current authenticated admin (from dependency)
    
    Returns:
        List of all applications sorted by date (newest first)
    """
    applications = await db.applications.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    
    return applications

@api_router.get("/admin/applications/{application_id}/resume")
async def download_application_resume(
    application_id: str,
    admin=Depends(get_current_admin)
):
    """
    Download resume for a specific application (admin only)
    
    Args:
        application_id: Application ID
        admin: Current authenticated admin (from dependency)
    
    Returns:
        File response with resume
    
    Raises:
        HTTPException: If application or file not found
    """
    # Find application
    application = await db.applications.find_one(
        {"id": application_id},
        {"_id": 0}
    )
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    filename = application.get("resume_path")
    if not filename:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Check if file exists
    filepath = UPLOAD_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Resume file not found on server")
    
    # Create display filename
    applicant_name = application.get("name", "applicant").replace(" ", "_")
    file_ext = Path(filename).suffix
    display_name = f"{applicant_name}_resume{file_ext}"
    
    logger.info(f"✅ Resume downloaded: {application_id}")
    
    return FileResponse(
        filepath,
        filename=display_name,
        media_type='application/octet-stream',
        headers={
            "Access-Control-Expose-Headers": "Content-Disposition",
            "Content-Disposition": f'attachment; filename="{display_name}"'
        }
    )

@api_router.get("/admin/email-logs", response_model=List[EmailLog])
async def get_email_logs(admin=Depends(get_current_admin), limit: int = 100):
    """
    Get email logs (admin only)
    
    Args:
        admin: Current authenticated admin (from dependency)
        limit: Maximum number of logs to return
    
    Returns:
        List of email logs sorted by date (newest first)
    """
    logs = await db.email_logs.find(
        {},
        {"_id": 0}
    ).sort("sent_at", -1).to_list(limit)
    
    return logs

@api_router.get("/admin/jobs", response_model=List[JobResponse])
async def get_admin_jobs(admin=Depends(get_current_admin)):
    """
    Get all jobs (admin view with full details)
    
    Args:
        admin: Current authenticated admin (from dependency)
    
    Returns:
        List of all jobs
    """
    jobs = await db.jobs.find({}, {"_id": 0}).to_list(200)
    return jobs

@api_router.post("/admin/jobs", response_model=JobResponse, status_code=201)
async def create_job(job_data: JobCreate, admin=Depends(get_current_admin)):
    """
    Create a new job posting (admin only)
    
    Args:
        job_data: Job creation data
        admin: Current authenticated admin (from dependency)
    
    Returns:
        Created job details
    """
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
    logger.info(f"✅ Job created: {job['title']}")
    
    job.pop("_id", None)
    return job

@api_router.put("/admin/jobs/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: str,
    job_data: JobUpdate,
    admin=Depends(get_current_admin)
):
    """
    Update an existing job posting (admin only)
    
    Args:
        job_id: Job ID
        job_data: Job update data
        admin: Current authenticated admin (from dependency)
    
    Returns:
        Updated job details
    
    Raises:
        HTTPException: If job not found
    """
    # Check if job exists
    existing = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Prepare update fields
    update_fields = {
        k: v for k, v in job_data.model_dump().items()
        if v is not None
    }
    
    # Update slug if title changed
    if "title" in update_fields:
        update_fields["slug"] = slugify(update_fields["title"])
    
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Update in database
    await db.jobs.update_one({"id": job_id}, {"$set": update_fields})
    
    # Get updated job
    updated = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    
    logger.info(f"✅ Job updated: {job_id}")
    
    return updated

@api_router.delete("/admin/jobs/{job_id}", status_code=204)
async def delete_job(job_id: str, admin=Depends(get_current_admin)):
    """
    Delete a job posting (admin only)
    
    Args:
        job_id: Job ID
        admin: Current authenticated admin (from dependency)
    
    Raises:
        HTTPException: If job not found
    """
    result = await db.jobs.delete_one({"id": job_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    logger.info(f"✅ Job deleted: {job_id}")
    
    return None

# ============================================================================
# APP CONFIGURATION
# ============================================================================

# Include API router
app.include_router(api_router)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# ============================================================================
# EVENT HANDLERS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    await seed_database()
    logger.info("🚀 Project P Innovations API started successfully")
    logger.info(f"📧 Email FROM: {EMAIL_FROM}")
    logger.info(f"📧 Email TO: {EMAIL_TO}")
    logger.info(f"🔐 JWT expiration: {JWT_EXPIRATION_HOURS} hours")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    client.close()
    logger.info("👋 MongoDB connection closed")

# ============================================================================
# ROOT ENDPOINT
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Project P Innovations API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/api/health"
    }