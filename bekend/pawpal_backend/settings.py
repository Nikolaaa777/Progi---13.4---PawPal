from pathlib import Path
import os
from dotenv import load_dotenv
import dj_database_url
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = config("SECRET_KEY", default="django-insecure-dev-key-change-in-production")
DEBUG = config("DEBUG", default=True, cast=bool)
ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
    "progi-13-4-pawpal.onrender.com",
    "pawpal-front.onrender.com",
    "progi-13-4-pawpal-3.onrender.com",
    "progi-13-4-pawpal-4.onrender.com",



]


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "django.contrib.sites",  #potrebno za allauth

    "rest_framework",
    "corsheaders",
    "drf_spectacular",

    #potrebno za allauth - slljedecih 4          
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",

    # - moje app
    "accounts.apps.AccountsConfig",
    "dogs",
    "walks",
    "reservations",
    "payments",
    "chat",
    "admin_api",
    "membership",
    "reviews",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "allauth.account.middleware.AccountMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "pawpal_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "pawpal_backend.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "pawpal_db",
        "USER": "pawpal_user",
        "PASSWORD": "jaka_lozinka",
        "HOST": "db",  # Changed to 'db' for Docker Compose service name
        "PORT": "5432",
        "OPTIONS": {"options": "-c search_path=pawpal,public"},
    }
}

# Override with DATABASE_URL if provided
database_url = config("DATABASE_URL", default="")
if database_url:
    DATABASES["default"] = dj_database_url.parse(database_url)

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS":{"min_length":8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = [
    "https://progi-13-4-pawpal-4.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173","http://localhost:8000",
    "http://127.0.0.1:8000", "https://progi-13-4-pawpal-3.onrender.com", "https://progi-13-4-pawpal-4.onrender.com",]


SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}

SPECTACULAR_SETTINGS = {
    "TITLE": "PawPal API",
    "DESCRIPTION": "Auth endpoints: register, login, logout, me, csrf.",
    "VERSION": "1.0.0",
}


SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {"access_type": "online"},
        "APP": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID", ""),
            "secret": os.getenv("GOOGLE_CLIENT_SECRET", ""),
            "key": "",
        },
    }
}


ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = [
    "email*",
    "password1",
    "first_name",
    "last_name",
] # * označava obaveznA POLJA
ACCOUNT_EMAIL_VERIFICATION = "none"


SITE_ID = 1

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

# gdje se vraća nakon Google login-a
LOGIN_REDIRECT_URL = "https://progi-13-4-pawpal-4.onrender.com"
LOGOUT_REDIRECT_URL = "https://progi-13-4-pawpal-4.onrender.com"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {
        "allauth": {"handlers": ["console"], "level": "DEBUG"},
        "django.request": {"handlers": ["console"], "level": "DEBUG"},
    },
}

#da odmah ode na google login, a ne na potvrdu prvo
SOCIALACCOUNT_LOGIN_ON_GET = True