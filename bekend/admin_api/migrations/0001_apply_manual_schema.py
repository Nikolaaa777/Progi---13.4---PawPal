from pathlib import Path
from django.db import migrations


def run_manual_schema(apps, schema_editor):
    sql_path = Path(__file__).resolve().parents[2] / "sql" / "manual_schema.sql"
    sql = sql_path.read_text(encoding="utf-8")

    # 1) Makni linije koje su samo komentari (dump ti ih ima puno: -- ...)
    lines = []
    for line in sql.splitlines():
        if line.strip().startswith("--"):
            continue
        lines.append(line)
    sql = "\n".join(lines)

    # 2) Splitaj po ';' i preskoči prazne dijelove
    statements = []
    for raw in sql.split(";"):
        stmt = raw.strip()
        if not stmt:
            continue
        statements.append(stmt)

    # 3) Izvrši svaki statement zasebno
    with schema_editor.connection.cursor() as cursor:
        for stmt in statements:
            cursor.execute(stmt)


class Migration(migrations.Migration):
    dependencies = []

    operations = [
        migrations.RunPython(run_manual_schema, reverse_code=migrations.RunPython.noop),
    ]
