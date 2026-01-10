# Database Backup & Rollback Guide

This document explains how to backup and rollback the database for safe deployments.

## Overview

Before deploying changes that involve database migrations or schema changes, create a backup of the production database. If the deployment fails, you can quickly rollback by renaming the databases.

## Quick Start

### Create a Backup

```bash
pnpm backup
```

This creates an exact clone of your database with a timestamp:
- Original: `motionexport`
- Backup: `motionexport_backup_20260110_103045`

### Rollback After Failed Deployment

If your deployment fails and you need to restore the backup:

1. **Stop your application** (to close database connections)

2. **Connect to PostgreSQL:**
   ```bash
   # Parse your DATABASE_URL to get credentials
   psql -h <host> -p <port> -U <user> -d postgres
   ```

3. **Terminate active connections:**
   ```sql
   SELECT pg_terminate_backend(pg_stat_activity.pid)
   FROM pg_stat_activity
   WHERE pg_stat_activity.datname = 'motionexport'
     AND pid <> pg_backend_pid();
   ```

4. **Rename current database to _old:**
   ```sql
   ALTER DATABASE "motionexport" RENAME TO "motionexport_old";
   ```

5. **Rename backup to original name:**
   ```sql
   ALTER DATABASE "motionexport_backup_20260110_103045" RENAME TO "motionexport";
   ```

6. **Restart your application**

## How It Works

The backup script uses PostgreSQL's `CREATE DATABASE WITH TEMPLATE` command to create an exact clone of the database:

- **Fast**: Copies database files internally (no dump/restore needed)
- **Exact replica**: All tables, indexes, constraints, and data
- **Same permissions**: Uses the same database owner/role
- **Atomic**: Either succeeds completely or fails with no partial state

## When to Use

### ✅ Always backup before:
- Running database migrations in production
- Making schema changes
- Upgrading Drizzle ORM or major dependencies
- Any deployment that touches the database

### ❌ No need to backup for:
- Frontend-only changes
- Code refactoring that doesn't affect database
- Configuration changes that don't involve schema

## Deployment Workflow

### Safe Deployment Process

```bash
# 1. Create backup
pnpm backup

# 2. Run migrations
pnpm migrate

# 3. Deploy application
# ... your deployment process ...

# 4. Test the deployment
# ... verify everything works ...

# 5. If everything works, delete old backups (optional)
# If deployment fails, rollback (see above)
```

### Example Production Deployment

```bash
# On your production server
cd /app/motion-export-backend

# Create backup before deployment
pnpm backup

# Output:
# 📊 Database Backup Script
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Source Database: motionexport
# Backup Database: motionexport_backup_20260110_103045
# Host: localhost:5432
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✅ Backup completed successfully!

# Run migrations
pnpm migrate

# Restart application
pm2 restart motion-export-backend

# Test deployment
curl https://api.motionexport.com/health

# If everything works, you're done!
# If deployment fails, rollback using the commands printed by the backup script
```

## Managing Backups

### List all backups

```sql
SELECT datname
FROM pg_database
WHERE datname LIKE '%_backup_%'
ORDER BY datname DESC;
```

### Check backup size

```sql
SELECT
  datname,
  pg_size_pretty(pg_database_size(datname)) as size
FROM pg_database
WHERE datname LIKE '%_backup_%'
ORDER BY datname DESC;
```

### Delete old backups

```sql
-- Drop a specific backup
DROP DATABASE "motionexport_backup_20260110_103045";
```

**Note:** Keep at least 1-2 recent backups for safety. Delete older backups once you're confident the deployment is stable.

## Troubleshooting

### Error: "database is being accessed by other users"

Active connections prevent database operations. Terminate them first:

```sql
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'your_database_name'
  AND pid <> pg_backend_pid();
```

### Error: "permission denied to create database"

Your database user needs `CREATEDB` privilege:

```sql
ALTER USER your_username CREATEDB;
```

### Error: "source database must not be accepting connections"

PostgreSQL requires no active connections to the source database during cloning. The script automatically terminates connections, but if you see this error, manually stop your application first.

## Best Practices

1. **Always backup before migrations** - Even small schema changes can go wrong
2. **Test rollback procedure** - Practice rollback on staging environment first
3. **Keep recent backups** - Don't delete backups immediately after deployment
4. **Monitor backup size** - Large databases take longer to clone
5. **Document backup timestamps** - Note which backup corresponds to which deployment

## Script Location

The backup script is located at:
```
scripts/backup-database.sh
```

It's called via pnpm script defined in `package.json`:
```json
"backup": "dotenv -- bash scripts/backup-database.sh"
```

## Environment Variables

The script reads `DATABASE_URL` from your `.env` file:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

The script automatically parses this URL to extract:
- Username
- Password
- Host
- Port
- Database name
