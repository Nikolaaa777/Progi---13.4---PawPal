# PawPal Backend (Auth only)

Django + DRF minimal backend that provides session-based login/register similar to your EasyRent backend style.

## Endpoints
- `GET /api/auth/csrf/` – get CSRF token (include it as `X-CSRFToken` header for POSTs when using cookies)
- `POST /api/auth/register/` – body: {email, first_name, last_name, password}
- `POST /api/auth/login/` – body: {email, password}
- `POST /api/auth/logout/` – clears the session
- `GET /api/auth/me/` – returns current user info

## Local run
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```
Open docs at `/api/docs/`.
