# Eventure — Event Management Platform

A full-stack event management platform built for CMPE 202, Spring 2026.  
Attendees discover and register for events; organizers create and manage them; admins moderate the platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12 + Django 5 + Django REST Framework |
| Auth | SimpleJWT (JWT, HS256) — 15-min access + refresh tokens |
| Database | PostgreSQL 16 + PostGIS 3 |
| Geo queries | GeoDjango (django.contrib.gis) + GDAL |
| Async Tasks | Celery + Redis |
| Email | Django SMTP (Gmail) + Celery async tasks |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| State | Zustand + React Query (TanStack) |
| Forms | React Hook Form + Zod |
| QR Codes | qrcode (Python) |
| iCal | icalendar (Python) |

---

## Features

### Attendee
- Browse and search events by keyword, category, and location
- Register for free events (ticket selection)
- Cancel RSVP from My Tickets page or Event Detail page
- My Tickets wallet with tabs: All / Confirmed / Cancelled
- Add event to Google Calendar
- Receive confirmation email with QR code upon registration
- Receive 24-hour reminder email before event

### Organizer
- Submit organizer access request (admin-approved workflow)
- Create and publish events with ticket tiers and capacity
- Search events on dashboard
- View attendee list with registration status; export as CSV
- Cancel events — all registered attendees are notified by email
- Receive email when event is approved or rejected by admin

### Admin
- Review and approve/reject events pending moderation
- Pending events shown first on dashboard; falls back to Live Events
- Click event title to view full organizer-submitted details
- Approve/reject organizer access requests
- Event Management: view all events, cancel or delete cancelled events
- User Management: ban/unban users
- Real-time dashboard stats (Pending / Live / Total Users / Organizer Requests)

### Email Notifications
| Trigger | Recipient |
|---------|-----------|
| Successful registration | Attendee (with QR code) |
| 24 hours before event | Attendee |
| Attendee cancels RSVP | Attendee |
| Organizer cancels event | All registered attendees |
| Event approved | Organizer |
| Event rejected | Organizer (with reason) |
| Password reset | User |

---

## Component Map

| Component | Apps | Owner |
|-----------|------|-------|
| C1 — Auth & Admin | `apps/authentication` `apps/users` `apps/admin_panel` | Teammate 1 |
| C2 — Events & Maps | `apps/events` | Prachi |
| C3 — Tickets & RSVP | `apps/tickets` `apps/payments` | Teammate 3 |
| C4 — Notifications & UI | `apps/notifications` + `frontend/` | Teammate 4 |

---

## Docker Setup (recommended — works on Windows and macOS)

Docker is the easiest way to run the full stack. It does not require installing Python, Node, PostgreSQL, or Redis locally.

### Prerequisites

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) for your OS (Windows or macOS). That's it.

### Steps

#### 1. Clone the repo and enter the project folder
```bash
git clone https://github.com/gopinathsjsu/team-project-the-debug-divas.git
cd team-project-the-debug-divas/eventflow
```

#### 2. Create your environment file
```bash
# macOS / Linux / Git Bash
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Open `.env` and fill in the required values:

```
SECRET_KEY=replace-this-with-any-long-random-string-50-chars-min

# Gmail SMTP — needed for email notifications
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password   # 16-char App Password, not your Gmail login
EMAIL_FROM=your-gmail@gmail.com
```

> **Gmail App Password**: Go to [myaccount.google.com](https://myaccount.google.com) → Security → 2-Step Verification → App passwords → generate one for "Mail".

> The `DATABASE_URL` and `REDIS_URL` are automatically injected by Docker Compose using the service names `postgres` and `redis`. You do **not** need to change those in `.env` for Docker.

#### 3. Build and start all services
```bash
docker compose up --build
```

This starts: PostgreSQL + PostGIS, Redis, Django backend, Celery worker, Celery beat, and the React frontend.

First build takes 2–5 minutes (downloading base images and installing dependencies). Subsequent starts are fast.

#### 4. Seed demo data (first time only)
In a second terminal:
```bash
docker compose exec backend python manage.py seed_data
```

#### 5. Open the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/v1 |
| Django admin | http://localhost:8000/django-admin |

#### Stopping
```bash
docker compose down          # stop containers, keep data
docker compose down -v       # stop and delete all data (fresh start)
```

#### Rebuilding after dependency changes
If `requirements.txt` or `package.json` changes, rebuild the affected image:
```bash
docker compose build backend
docker compose build frontend
docker compose up
```

---

## Local Development Setup (without Docker)

Use this only if you need to debug native GDAL/GeoDjango behaviour or prefer a local stack. Docker is recommended for day-to-day development.

### Windows

#### Prerequisites — install once

1. **Python 3.12** — `winget install -e --id Python.Python.3.12`
2. **Node.js 20+** — `winget install -e --id OpenJS.NodeJS.LTS`
3. **pnpm** — `npm install -g pnpm`
4. **PostgreSQL 18** — download from the official PostgreSQL website. Set a password for `postgres` during install.
5. **PostGIS** — open Stack Builder after PostgreSQL installs → Spatial Extensions → PostGIS 3.x for PostgreSQL 18. When asked "Create spatial database?" choose No.
6. **Redis** — `winget install -e --id Redis.Redis`

#### Database setup
Open SQL Shell (psql) and run:
```sql
CREATE USER eventure WITH PASSWORD 'eventure';
CREATE DATABASE eventure_db OWNER eventure;
GRANT ALL PRIVILEGES ON DATABASE eventure_db TO eventure;
ALTER USER eventure CREATEDB;
\q
```
Then enable PostGIS:
```bash
psql -U postgres -d eventure_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

#### Backend setup
```powershell
cd backend
cp .env.example .env        # fill in SECRET_KEY; DATABASE_URL stays as localhost
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
$env:DJANGO_SETTINGS_MODULE="config.settings.development"
python manage.py migrate
python manage.py seed_data
```

> **GDAL paths on Windows**: `config/settings/development.py` auto-sets the GDAL/GEOS paths for a default PostgreSQL 18 install. If you installed to a different drive or version, set the environment variables `GDAL_LIBRARY_PATH` and `GEOS_LIBRARY_PATH` to the correct `.dll` paths before running Django.

#### Frontend setup
```powershell
cd frontend
cp .env.example .env.local   # VITE_API_BASE_URL=http://localhost:8000/v1
pnpm install
```

#### Running
Open 3 terminals:

**Terminal 1 — Redis**
```powershell
& "C:\Program Files\Redis\redis-server.exe"
```

**Terminal 2 — Django** (http://localhost:8000)
```powershell
cd backend
venv\Scripts\Activate.ps1
$env:DJANGO_SETTINGS_MODULE="config.settings.development"
python manage.py runserver
```

**Terminal 3 — Celery worker** (processes email tasks)
```powershell
cd backend
venv\Scripts\Activate.ps1
$env:DJANGO_SETTINGS_MODULE="config.settings.development"
celery -A config worker --loglevel=info
```

**Terminal 4 — Celery beat** (scheduled reminders)
```powershell
cd backend
venv\Scripts\Activate.ps1
$env:DJANGO_SETTINGS_MODULE="config.settings.development"
celery -A config beat --loglevel=info
```

**Terminal 5 — React** (http://localhost:5173)
```powershell
cd frontend
pnpm dev
```

---

### macOS

#### Prerequisites — install once
```bash
brew install python@3.12 node redis gdal
brew install --cask docker          # Docker Desktop, if using Docker
npm install -g pnpm
```

Install PostgreSQL with PostGIS:
```bash
brew install postgresql@16 postgis
brew services start postgresql@16
```

#### Database setup
```bash
psql postgres -c "CREATE USER eventure WITH PASSWORD 'eventure';"
psql postgres -c "CREATE DATABASE eventure_db OWNER eventure;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE eventure_db TO eventure;"
psql postgres -c "ALTER USER eventure CREATEDB;"
psql eventure_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

#### Backend setup
```bash
cd backend
cp .env.example .env   # fill in SECRET_KEY; DATABASE_URL stays as localhost
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt
export DJANGO_SETTINGS_MODULE=config.settings.development
python manage.py migrate
python manage.py seed_data
```

#### Frontend setup
```bash
cd frontend
cp .env.example .env.local
pnpm install
```

#### Running
Open 3 terminals:

**Terminal 1 — Redis**
```bash
brew services start redis
```

**Terminal 2 — Django** (http://localhost:8000)
```bash
cd backend
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=config.settings.development
python manage.py runserver
```

**Terminal 3 — Celery worker** (processes email tasks)
```bash
cd backend
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=config.settings.development
celery -A config worker --loglevel=info
```

**Terminal 4 — Celery beat** (scheduled reminders)
```bash
cd backend
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=config.settings.development
celery -A config beat --loglevel=info
```

**Terminal 5 — React** (http://localhost:5173)
```bash
cd frontend
pnpm dev
```

---

## Troubleshooting

**Emails not sending**
- Make sure `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, and `EMAIL_FROM` are set in `.env`
- Use a Gmail App Password (not your Gmail account password)
- After editing `.env`, restart with `docker compose up -d --force-recreate` (plain `restart` does not re-read env files)
- Check Celery worker logs: `docker compose logs celery_worker`

**Celery tasks not running**
- Ensure `config/__init__.py` imports the Celery app (already done — do not remove)
- Confirm Redis is running: `docker compose ps` or `redis-cli ping`

**PostGIS / GDAL errors on local setup**
- On Windows, GDAL paths are auto-configured for a default PostgreSQL 18 install. Set `GDAL_LIBRARY_PATH` and `GEOS_LIBRARY_PATH` manually if installed elsewhere
- On macOS, run `brew install gdal` if missing

**Port already in use**
```bash
docker compose down && docker compose up --build
```

---

## Seed Data

```bash
# Docker
docker compose exec backend python manage.py seed_data
docker compose exec backend python manage.py seed_data --flush   # wipe and re-seed

# Local
python manage.py seed_data
python manage.py seed_data --flush
```

Re-running without `--flush` refreshes event dates to the future without deleting registrations or users.

### Test accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `AdminUser@eventure.dev` | `AdminUser123` |
| Organizer | `AliceOrganizer@eventure.dev` | `AliceOrganizer123` |
| Organizer | `BobOrganizer@eventure.dev` | `BobOrganizer123` |
| Attendee | `CarolAttendee@eventure.dev` | `CarolAttendee123` |
| Attendee | `DavidAttendee@eventure.dev` | `DavidAttendee123` |
| Attendee | `EveAttendee@eventure.dev` | `EveAttendee123` |

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/v1/auth/register/` | — | Register (role: ATTENDEE or ORGANIZER request) |
| POST | `/v1/auth/login/` | — | Login, returns access + refresh tokens |
| POST | `/v1/auth/token/refresh/` | — | Refresh access token |
| POST | `/v1/auth/logout/` | JWT | Blacklist refresh token |
| GET/PUT | `/v1/auth/me/` | JWT | View or update profile |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/events/` | — | Browse/search events (`?search=`, `?category=`) |
| POST | `/v1/events/` | Organizer | Create event (starts as DRAFT) |
| GET | `/v1/events/:id/` | — | Event detail |
| PUT | `/v1/events/:id/` | Organizer | Update event |
| POST | `/v1/events/:id/publish/` | Organizer | Submit for admin review |
| POST | `/v1/events/:id/cancel/` | Organizer | Cancel event, notify all attendees |
| GET | `/v1/events/:id/calendar.ics` | — | Download iCal |

### Tickets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/tickets/events/:id/tiers/` | — | List ticket tiers |
| POST | `/v1/tickets/events/:id/tiers/` | Organizer | Create ticket tier |
| POST | `/v1/tickets/events/:id/register/` | JWT | Register for event |
| GET | `/v1/tickets/my-tickets/` | JWT | My ticket wallet |
| POST | `/v1/tickets/:id/cancel/` | JWT | Cancel a registration |
| GET | `/v1/tickets/events/:id/attendees/` | Organizer | Attendee list |
| GET | `/v1/tickets/events/:id/attendees/export/` | Organizer | Export attendees as CSV |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/admin/events/` | Admin | All events (filterable by status) |
| PUT | `/v1/admin/events/:id/approve/` | Admin | Approve pending event |
| PUT | `/v1/admin/events/:id/reject/` | Admin | Reject pending event |
| PUT | `/v1/admin/events/:id/cancel/` | Admin | Cancel any event |
| DELETE | `/v1/admin/events/:id/` | Admin | Delete cancelled event |
| GET | `/v1/admin/users/` | Admin | All users |
| PUT | `/v1/admin/users/:id/ban/` | Admin | Ban or unban user |
| GET | `/v1/admin/organizer-requests/` | Admin | Pending organizer requests |
| PUT | `/v1/admin/organizer-requests/:id/approve/` | Admin | Grant organizer role |
| PUT | `/v1/admin/organizer-requests/:id/reject/` | Admin | Reject organizer request |
| GET | `/v1/admin/audit-log/` | Admin | Full audit trail |

---

## Running Tests

```bash
# Docker
docker compose exec backend pytest --cov=apps

# Local
cd backend
pytest --cov=apps
```

---

## Git Workflow

```bash
git fetch origin
git checkout <your-branch>
git merge origin/main

git add .
git commit -m "feat: your message"
git push origin <your-branch>
```
