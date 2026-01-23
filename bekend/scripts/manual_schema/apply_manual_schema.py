from pathlib import Path
import os
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pawpal_backend.settings")

import django
django.setup()

from django.db import connection

FLAG_KEY = "manual_schema_v1"


def already_applied() -> bool:
    with connection.cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS public.schema_flags (
                key text PRIMARY KEY,
                applied_at timestamptz NOT NULL DEFAULT now()
            );
        """)
        cursor.execute("SELECT 1 FROM public.schema_flags WHERE key=%s;", [FLAG_KEY])
        return cursor.fetchone() is not None


def mark_applied():
    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO public.schema_flags(key) VALUES (%s) ON CONFLICT (key) DO NOTHING;",
            [FLAG_KEY],
        )


def main():
    if already_applied():
        print("ℹ️ Manual schema already applied, skipping.")
        return

    sql_path = Path(__file__).parent / "manual_schema.sql"
    sql = sql_path.read_text(encoding="utf-8")

    lines = []
    for line in sql.splitlines():
        if line.strip().startswith("--"):
            continue
        lines.append(line)
    sql = "\n".join(lines)

    statements = [s.strip() for s in sql.split(";") if s.strip()]

    with connection.cursor() as cursor:
        for stmt in statements:
            cursor.execute(stmt)

    mark_applied()
    print("✅ Manual SQL schema applied successfully.")


if __name__ == "__main__":
    main()
