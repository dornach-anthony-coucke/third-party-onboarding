# Infrastructure

This directory contains infrastructure configuration for the third-party onboarding project.

## Docker Compose

### PostgreSQL Database

To start the PostgreSQL database:

```bash
cd infra
docker compose up -d
```

To stop the database:

```bash
docker compose down
```

To stop and remove volumes (deletes data):

```bash
docker compose down -v
```

### Database Connection

Once running, the database is accessible with:

- **Host**: localhost
- **Port**: 5432
- **Database**: third-party-onboarding
- **User**: postgres
- **Password**: postgres

**Connection String**:

```
postgresql://postgres:postgres@localhost:5432/third-party-onboarding
```

### Environment Variable

Add this to your `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/third-party-onboarding
DATABASE_SSL=false
```

## Health Check

The database includes a health check that verifies it's ready to accept connections. You can check the status with:

```bash
docker compose ps
```
