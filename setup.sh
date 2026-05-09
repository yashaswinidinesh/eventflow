#!/usr/bin/env bash
# First-time setup: creates .env and loads seed data.
# Run once after cloning: bash setup.sh

set -e

cd "$(dirname "$0")"

# 1. Create .env from example if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
  sed -i.bak "s|change-me-to-a-long-random-string-minimum-50-chars|$SECRET|" .env && rm -f .env.bak
  echo ".env created with a generated SECRET_KEY"
else
  echo ".env already exists, skipping"
fi

# 2. Build and start all services
docker compose up --build -d

# 3. Wait for backend to be healthy
echo "Waiting for backend to be ready..."
until docker compose exec backend curl -sf http://localhost:8000/v1/events/ > /dev/null 2>&1; do
  sleep 3
done

# 4. Load seed data
docker compose exec backend python manage.py seed_data

echo ""
echo "Setup complete!"
echo "  Frontend : http://localhost:5173"
echo "  Backend  : http://localhost:8000/v1"
echo ""
echo "Test accounts (all passwords follow the pattern <Name><Role>123):"
echo "  Admin     : AdminUser@eventure.dev       / AdminUser123"
echo "  Organizer : AliceOrganizer@eventure.dev  / AliceOrganizer123"
echo "  Attendee  : CarolAttendee@eventure.dev   / CarolAttendee123"
