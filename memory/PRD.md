# PRD — Project P Innovations Website

## Original Problem Statement
Build a complete production-ready website for Project P Innovations — an AI product services and consultancy company. Includes public pages (Home, Careers, Apply), admin panel (JWT auth, job CRUD, application management), dark glassmorphic design system, and mock email notifications.

## Architecture
- **Frontend:** React + Tailwind CSS + Framer Motion + Shadcn UI
- **Backend:** FastAPI + MongoDB (Motor) + JWT Auth + bcrypt
- **Database:** MongoDB (collections: admins, jobs, applications, email_logs)
- **File Storage:** Server filesystem (/app/backend/uploads/)

## User Personas
1. **Visitors** — Browse services, view job listings, submit applications
2. **Job Seekers** — Filter careers, apply with resume upload
3. **Admins** — Login, manage jobs (CRUD), review applications, view email logs

## Core Requirements
- Dark theme (#071020) with #FF7A2A accent, glass-morphism
- Animated hero with gradient background
- Job listings with search/filter (location, seniority)
- Application form with resume upload (PDF/DOC/DOCX, 5MB max)
- JWT admin authentication
- Rate limiting on apply endpoint (10/hour/IP)
- Mock email system (logged + stored in DB)

## What's Been Implemented (Feb 10, 2026)
- [x] Home page (Hero + Scrolling Ticker + Services + About Preview)
- [x] Animated hero with CSS gradient + particles + floating orbs + vignette (video-ready)
- [x] Scrolling ticker with 7 service items + orange dot separators
- [x] 3 service cards: AI Products, AI Solutions & Automation, Talent & Hiring Consultancy
- [x] White hexagon outline logo (no fill, no P inside) + "Project P INNOVATIONS"
- [x] Footer with UK (+44 7717 206215) and India (+91 9000 242484) phone numbers
- [x] Careers page (Job listings with search, location & seniority filters)
- [x] Apply page (Form with name, email, message, job selection, resume upload)
- [x] Admin Login (JWT authentication)
- [x] Admin Dashboard (Jobs CRUD, applications viewer, email logs)
- [x] Auto-seeding (admin user + 3 sample jobs)
- [x] File upload validation (type + size)
- [x] Rate limiting on /api/apply
- [x] Responsive design (desktop/tablet/mobile)
- [x] Framer Motion animations + prefers-reduced-motion support
- [x] Glass-morphism design system
- [x] Documentation (README, API_DOC, SECURITY, DEPLOYMENT_CHECKLIST, DELIVERY_SUMMARY)
- [x] Scripts (setup_dev.sh, seed_db.sh, verify.sh, get_background.sh)
- [x] Video-ready hero: drop mp4 to /frontend/public/videos/ai-background.mp4

## Backlog
- P0: None remaining
- P1: Real SMTP email integration (replace mock)
- P1: Admin password change functionality
- P2: Job search by keyword in admin
- P2: Application status tracking (reviewed/pending/rejected)
- P2: More animation polish (parallax effects)
- P3: Dark/light theme toggle
- P3: i18n support
