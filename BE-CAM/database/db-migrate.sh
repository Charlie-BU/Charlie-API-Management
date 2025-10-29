
echo "Database Migration Start..."
uv run alembic revision --autogenerate -m "db migrate"
uv run alembic upgrade head
echo "Database Migration Success"
