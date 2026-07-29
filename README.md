# CreativeHub SA

> **Empowering South African creatives through technology.**

CreativeHub SA is a cloud-powered platform built to help artists, designers, photographers, musicians, illustrators, writers and other creatives showcase their work, connect with clients, collaborate with one another and grow sustainable creative careers.

This project was developed as an original software engineering project for the **WeThinkCode_ Elective Programme**, demonstrating practical software engineering, cloud computing, data engineering and modern application development.

> **Scope note:** this repo is submitted as the **Cloud Computing** elective project. The data engineering work (ETL pipelines, warehouse, analytics on this platform's data) lives in a separate repository so each elective has its own original, standalone proof of work.

**Demo video:** _link goes here once recorded_

---

# Project Status

Phase 1 (auth, artist profiles, landing page) is built and running locally. See [Getting Started](#getting-started) below.

- [x] Project setup
- [x] Authentication (JWT, register/login)
- [x] Landing page
- [x] Database design (Users, Artist Profiles)
- [x] Artist profile view/edit
- [ ] Portfolio uploads (Phase 2)
- [ ] Creative feed (Phase 2)
- [ ] Commission system (Phase 3)
- [ ] Cloud deployment to AWS (Phase 4)

---

# Getting Started

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (for local Postgres)

## 1. Start the database

```bash
docker compose up -d
```

## 2. Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # fish shell: source .venv/bin/activate.fish
pip install -r requirements.txt --break-system-packages
cp .env.example .env
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. Interactive API docs: `http://localhost:8000/docs`.

## 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Architecture, at a glance

```
Browser (React, :5173)
   │  fetch() with JSON + JWT bearer token
   ▼
FastAPI backend (:8000)
   │  SQLAlchemy ORM
   ▼
PostgreSQL (Docker, :5432)
```

- **Register/Login** (`/auth/register`, `/auth/login`) issue a JWT signed with `SECRET_KEY`.
- The frontend stores the token and attaches it as `Authorization: Bearer <token>` on requests that need to know who's asking.
- **`/profiles/me`** reads the token, looks up the matching user, and returns/updates their `ArtistProfile` row.

---

# The Problem

South Africa has thousands of talented creatives.

Many rely on social media to showcase their work, but platforms like Instagram or Facebook were never designed to help artists manage commissions, discover opportunities or understand their audience.

CreativeHub SA aims to become a central digital home for South African creatives by providing:

- Professional portfolios
- Commission management
- Creative networking
- Analytics
- Cloud storage
- AI-powered recommendations
- Community collaboration

---

# Project Vision

Our vision is to create a platform where creativity and technology work together to empower artists.

Instead of simply posting artwork online, creatives should be able to:

- Build a professional portfolio
- Receive commission requests
- Track project progress
- Discover collaboration opportunities
- Analyse audience engagement
- Securely store creative work in the cloud
- Build a verified creative profile

---

# Target Audience

CreativeHub SA is designed for:

- Digital Artists
- Traditional Artists
- Graphic Designers
- UI/UX Designers
- Photographers
- Animators
- Illustrators
- Fashion Designers
- Writers
- Musicians
- Students
- Creative Agencies

---

# Core Features

## Portfolio Builder

Artists can create beautiful portfolio pages showcasing their work.

---

## Commission Marketplace

Clients can browse artists and submit commission requests.

---

## Creative Feed

A community feed where creatives can share new work and receive feedback.

---

## Artist Profiles

Professional profiles including:

- Biography
- Skills
- Portfolio
- Social links
- Experience
- Ratings

---

## Cloud Storage

Secure storage for artwork, videos and creative assets.

---

## Analytics Dashboard

Artists receive insights such as:

- Portfolio views
- Likes
- Shares
- Commission requests
- Audience growth
- Engagement trends

---

## AI Recommendations

Future implementation:

- Similar artists
- Collaboration suggestions
- Portfolio improvement recommendations
- Creative prompts

---

# Cloud Computing Components

This project demonstrates cloud engineering principles through:

- AWS S3 for media storage
- Amazon RDS for relational data
- AWS Lambda
- API Gateway
- CloudFront
- Amazon Cognito Authentication
- EC2 Deployment
- CloudWatch Monitoring

---

# Data Engineering Components

CreativeHub SA includes real-world data engineering concepts.

Example datasets include:

- User activity
- Portfolio views
- Artwork uploads
- Categories
- Commission requests
- Engagement metrics
- Search history

Data engineering tasks include:

- ETL pipelines
- Data cleaning
- Data warehouse
- Analytics dashboards
- Trend analysis
- Recommendation datasets

---

# Planned Tech Stack

Frontend

- React
- Tailwind CSS
- TypeScript

Backend

- Python
- FastAPI

Database

- PostgreSQL

Cloud

- AWS

Storage

- Amazon S3

Authentication

- AWS Cognito

Analytics

- Python
- Pandas
- Power BI / Apache Superset

Version Control

- Git
- GitHub

---

# Project Roadmap

## Phase 1

- Project setup
- Authentication
- Landing page
- Database design
- Artist profiles

## Phase 2

- Portfolio uploads
- Creative feed
- Search
- Categories

## Phase 3

- Commission system
- Notifications
- Dashboards

## Phase 4

- Cloud deployment
- AI recommendations
- Performance optimisation


