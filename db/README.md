# Database — Eventure

PostgreSQL 16 + PostGIS + pg_trgm.

## Migrations
Managed by Prisma from `backend/`:
```bash
cd backend && pnpm prisma migrate dev --name <name>
```

## Seeds
```bash
psql $DATABASE_URL -f db/seeds/01_categories.sql
```

## Extensions
| Extension | Purpose |
|-----------|---------|
| uuid-ossp | UUID generation |
| postgis   | Geo radius queries |
| pg_trgm   | Full-text search |
