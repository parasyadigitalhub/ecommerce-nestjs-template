# PostgreSQL Migration Commands

## Once PostgreSQL is Running

After you have PostgreSQL set up and running (see POSTGRESQL_SETUP.md), run these commands:

### Option 1: Using Migrations (Recommended)

```bash
# Create and apply migration
npx prisma migrate dev --name init_postgresql

# Seed the database
npm run prisma:seed
```

### Option 2: Using DB Push (Alternative)

```bash
# Push schema directly to database
npx prisma db push

# Seed the database
npm run prisma:seed
```

### Option 3: Reset Everything (if needed)

```bash
# Reset database and apply migrations
npx prisma migrate reset --force

# This will:
# - Drop the database
# - Recreate it
# - Apply all migrations
# - Run the seed script automatically
```

## Verify Setup

```bash
# Check database connection
npx prisma db pull

# Open Prisma Studio to view data
npx prisma studio

# Start the application
npm run start:dev
```

## Test the API

Once the application is running:

1. **Base URL**: `http://localhost:3000/v1`

2. **Login**: 
   ```bash
   curl -X POST http://localhost:3000/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@ecommerce.com","password":"password@123"}'
   ```

3. **Get Products**:
   ```bash
   curl http://localhost:3000/v1/products
   ```

4. **Get Categories**:
   ```bash
   curl http://localhost:3000/v1/categories
   ```

## Current Status

✅ **Schema Updated**: PostgreSQL provider with proper decimal types
✅ **Environment Configured**: DATABASE_URL updated for PostgreSQL
✅ **Client Generated**: Prisma client ready for PostgreSQL
⏳ **Pending**: PostgreSQL database setup and migration

The application is ready to connect to PostgreSQL once the database is available.
