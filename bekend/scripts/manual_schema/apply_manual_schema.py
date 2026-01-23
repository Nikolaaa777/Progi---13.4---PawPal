from pathlib import Path
import os
import sys

# Ensure project root (/app) is on PYTHONPATH
ROOT = Path(__file__).resolve().parents[2]  # /app
sys.path.insert(0, str(ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pawpal_backend.settings")

import django
django.setup()

from django.db import connection


def main():
    sql_path = Path(__file__).parent / "manual_schema.sql"
    sql = sql_path.read_text(encoding="utf-8")

    # remove full-line comments
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

    print("Manual SQL schema applied successfully.")


if __name__ == "__main__":
    main()
