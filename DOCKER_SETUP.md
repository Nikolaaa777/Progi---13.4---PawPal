# Docker Setup Guide for PawPal

This guide explains how to run the PawPal application using Docker Compose.

## Prerequisites

- Docker Desktop installed and running (or Docker Engine + Docker Compose)
- Git (to clone the repository if needed)

## Quick Start

1. **Navigate to the project directory:**
   ```bash
   cd Progi---13.4---PawPal
   ```

2. **Create the backend `.env` file:**
   Create a file `bekend/.env` with the following content:
   ```env
   SECRET_KEY=your-secret-key-here-change-in-production
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1,backend,frontend
   
   # Database Configuration for Docker
   DATABASE_URL=postgresql://pawpal_user:jaka_lozinka@db:5432/pawpal_db
   
   # Optional: Google OAuth (leave empty if not using)
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   
   # Optional: Payment Configuration (leave empty if not using)
   PAYPAL_CLIENT_ID=
   PAYPAL_CLIENT_SECRET=
   PAYPAL_MODE=sandbox
   STRIPE_SECRET_KEY=
   STRIPE_PUBLISHABLE_KEY=
   ```

3. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```
   
   This will:
   - Build the backend (Django) Docker image
   - Build the frontend (React/Vite) Docker image
   - Start PostgreSQL database
   - Start all services

4. **Run database migrations:**
   In a new terminal, run:
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

5. **Create a superuser (optional):**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

6. **Access the application:**
   - **Frontend:** http://localhost:5173
   - **Backend API:** http://localhost:8000
   - **API Documentation:** http://localhost:8000/api/docs/
   - **Django Admin:** http://localhost:8000/admin/

## Docker Services

The `docker-compose.yml` file defines three services:

### 1. `db` (PostgreSQL Database)
- **Image:** postgres:16
- **Port:** 5433 (mapped from container 5432)
- **Database:** pawpal_db
- **User:** pawpal_user
- **Password:** jaka_lozinka

### 2. `backend` (Django API)
- **Build:** ./bekend (uses Dockerfile in bekend directory)
- **Port:** 8000
- **Environment:** Loads from `bekend/.env`
- **Dependencies:** Depends on `db` service

### 3. `frontend` (React/Vite)
- **Build:** ./frontend (uses Dockerfile in frontend directory)
- **Port:** 5173
- **Dependencies:** Depends on `backend` service
- **Proxy:** Vite proxy forwards `/api` requests to `backend:8000`

## Common Commands

### Start services in detached mode:
```bash
docker-compose up -d
```

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Stop services:
```bash
docker-compose stop
```

### Stop and remove containers:
```bash
docker-compose down
```

### Stop and remove containers + volumes (⚠️ deletes database data):
```bash
docker-compose down -v
```

### Execute commands in containers:
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access Django shell
docker-compose exec backend python manage.py shell

# Access PostgreSQL
docker-compose exec db psql -U pawpal_user -d pawpal_db
```

### Rebuild after code changes:
```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up --build
```

## Development Workflow

### Hot Reload
Both frontend and backend support hot reload:
- **Frontend:** Vite dev server automatically reloads on file changes
- **Backend:** Django dev server (runserver) automatically reloads on Python file changes

### Making Code Changes
1. Edit files in `bekend/` or `frontend/` directories
2. Changes are automatically picked up (thanks to volume mounts)
3. No need to rebuild containers for code changes

### Installing New Packages

**Backend (Python packages):**
```bash
docker-compose exec backend pip install <package-name>
docker-compose exec backend pip freeze > bekend/requirements.txt
```

**Frontend (npm packages):**
```bash
docker-compose exec frontend npm install <package-name>
# Changes are saved to package.json automatically via volume mount
```

## Troubleshooting

### Database Connection Errors
- Ensure the `db` service is running: `docker-compose ps`
- Check database logs: `docker-compose logs db`
- Verify `DATABASE_URL` in `bekend/.env` uses `db` as host (not `localhost`)

### Port Already in Use
If ports 8000, 5173, or 5433 are already in use, you can change them in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Change host port
```

### Frontend Can't Connect to Backend
- Check that Vite proxy is configured correctly in `frontend/vite.config.js`
- Ensure backend is accessible: `docker-compose logs backend`
- Check CORS settings in `bekend/pawpal_backend/settings.py`

### Environment Variables Not Working
- Ensure `bekend/.env` file exists
- Check file permissions
- Verify variable names match those in `settings.py`

### Container Won't Start
- Check logs: `docker-compose logs <service-name>`
- Verify Dockerfile syntax
- Ensure all required files exist

### Database Migrations Failing
```bash
# Reset database (⚠️ deletes all data)
docker-compose down -v
docker-compose up -d db
docker-compose up -d backend
docker-compose exec backend python manage.py migrate
```

## File Structure

```
Progi---13.4---PawPal/
├── docker-compose.yml          # Docker Compose configuration
├── bekend/                      # Backend (Django)
│   ├── Dockerfile              # Backend Docker image
│   ├── .env                    # Backend environment variables (create this)
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
├── frontend/                    # Frontend (React/Vite)
│   ├── Dockerfile              # Frontend Docker image
│   ├── package.json
│   ├── vite.config.js
│   └── ...
└── ...
```

## Environment Variables Reference

### Backend `.env` file (`bekend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes | - | Django secret key |
| `DEBUG` | Yes | `True` | Django debug mode |
| `ALLOWED_HOSTS` | Yes | - | Comma-separated list of allowed hosts |
| `DATABASE_URL` | No* | - | PostgreSQL connection URL (for Docker, use `postgresql://pawpal_user:jaka_lozinka@db:5432/pawpal_db`) |
| `GOOGLE_CLIENT_ID` | No | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | - | Google OAuth client secret |
| `PAYPAL_CLIENT_ID` | No | - | PayPal client ID |
| `PAYPAL_CLIENT_SECRET` | No | - | PayPal client secret |
| `PAYPAL_MODE` | No | `sandbox` | PayPal mode (sandbox/live) |
| `STRIPE_SECRET_KEY` | No | - | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | No | - | Stripe publishable key |

*If `DATABASE_URL` is not set, Django will use individual `DB_HOST`, `DB_PORT` settings (see `settings.py`).

## Network Configuration

All services are on the same Docker network and can communicate using service names:
- Frontend → Backend: `http://backend:8000`
- Backend → Database: `db:5432`

The frontend Vite proxy forwards `/api/*` requests from the browser to `http://backend:8000`.

## Production Deployment

For production:
1. Set `DEBUG=False` in `.env`
2. Use a secure `SECRET_KEY`
3. Configure proper `ALLOWED_HOSTS`
4. Use environment-specific database credentials
5. Set up proper SSL/HTTPS
6. Use production-ready WSGI server (gunicorn, uwsgi) instead of `runserver`
7. Configure static file serving (Nginx, AWS S3, etc.)
