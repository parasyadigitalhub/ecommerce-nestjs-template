# PostgreSQL Setup Guide

## Prerequisites

Before running the migration, you need to have PostgreSQL installed and running.

### Option 1: Install PostgreSQL Locally

1. **Download PostgreSQL**: Visit https://www.postgresql.org/download/
2. **Install PostgreSQL** with default settings
3. **Remember the password** you set for the `postgres` user during installation
4. **Start PostgreSQL service** (usually starts automatically)

### Option 2: Use Docker (Recommended for Development)

```bash
# Pull PostgreSQL image
docker pull postgres:15

# Run PostgreSQL container
docker run --name ecommerce-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ecommerce_db \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

### Option 3: Use Cloud PostgreSQL

- **Supabase**: https://supabase.com (Free tier available)
- **Railway**: https://railway.app (Free tier available)
- **Neon**: https://neon.tech (Free tier available)
- **AWS RDS**: https://aws.amazon.com/rds/
- **Google Cloud SQL**: https://cloud.google.com/sql

## Configuration

### Update Environment Variables

The `.env` file has been updated with PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce_db?schema=public"
```

**Customize the connection string** based on your setup:
- `postgres`: username (default is `postgres`)
- `password`: your PostgreSQL password
- `localhost:5432`: host and port (change if using cloud/remote database)
- `ecommerce_db`: database name

### For Cloud Databases

If using a cloud provider, replace the DATABASE_URL with your provider's connection string:

```env
# Example for Supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Example for Railway
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway"

# Example for Neon
DATABASE_URL="postgresql://[USERNAME]:[PASSWORD]@[HOSTNAME]/[DATABASE]?sslmode=require"
```

## Database Setup

### 1. Create Database (if not using Docker)

Connect to PostgreSQL and create the database:

```sql
-- Connect to PostgreSQL as postgres user
psql -U postgres

-- Create database
CREATE DATABASE ecommerce_db;

-- Grant permissions (if needed)
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO postgres;

-- Exit
\q
```

### 2. Run Migrations

```bash
# Generate and apply migrations
npx prisma migrate dev --name init_postgresql

# This will:
# - Create migration files
# - Apply them to your PostgreSQL database
# - Generate the Prisma client
```

### 3. Seed the Database

```bash
# Run the seed script
npm run prisma:seed
```

## Verification

### Check Database Connection

```bash
# Test the connection
npx prisma db pull
```

### View Database in Prisma Studio

```bash
# Open Prisma Studio
npx prisma studio
```

This will open a web interface at `http://localhost:5555` where you can view and edit your data.

## Troubleshooting

### Connection Issues

1. **Check PostgreSQL is running**:
   ```bash
   # For local installation
   pg_isready -h localhost -p 5432
   
   # For Docker
   docker ps | grep postgres
   ```

2. **Verify credentials**: Make sure username/password in DATABASE_URL are correct

3. **Check firewall**: Ensure port 5432 is accessible

4. **Database exists**: Make sure the database `ecommerce_db` exists

### Migration Issues

1. **Reset migrations** (if needed):
   ```bash
   npx prisma migrate reset --force
   ```

2. **Manual database creation**:
   ```bash
   npx prisma db push
   ```

## Production Considerations

1. **Use connection pooling** (PgBouncer, Prisma Data Proxy)
2. **Set up SSL** for secure connections
3. **Configure backup strategy**
4. **Monitor performance** and optimize queries
5. **Use environment-specific databases** (dev, staging, prod)

## Next Steps

After PostgreSQL is set up and migrations are complete:

1. Start the application: `npm run start:dev`
2. Test API endpoints at `http://localhost:3000/v1`
3. Login with: `admin@ecommerce.com` / `password@123`
