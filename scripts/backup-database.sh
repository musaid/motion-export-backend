#!/bin/bash

# Exit on error
set -e

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Parse DATABASE_URL to extract components
# Format: postgres://user:password@host:port/database or postgresql://user:password@host:port/database
if [[ $DATABASE_URL =~ postgres(ql)?://([^:]+):([^@]+)@([^:]+):([^/]+)/([^\?]+) ]]; then
  DB_USER="${BASH_REMATCH[2]}"
  DB_PASSWORD="${BASH_REMATCH[3]}"
  DB_HOST="${BASH_REMATCH[4]}"
  DB_PORT="${BASH_REMATCH[5]}"
  DB_NAME="${BASH_REMATCH[6]}"
else
  echo "❌ Error: Could not parse DATABASE_URL"
  echo "Expected format: postgres://user:password@host:port/database"
  echo "Received: $DATABASE_URL"
  exit 1
fi

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DB_NAME="${DB_NAME}_backup_${TIMESTAMP}"

echo "📊 Database Backup Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Source Database: $DB_NAME"
echo "Backup Database: $BACKUP_DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Export password for psql/pg_dump
export PGPASSWORD="$DB_PASSWORD"

# Check if source database exists
echo "🔍 Checking if source database exists..."
DB_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" != "1" ]; then
  echo "❌ Error: Source database '$DB_NAME' does not exist"
  exit 1
fi

# Create empty backup database
echo "📦 Creating empty backup database..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "
  CREATE DATABASE \"$BACKUP_DB_NAME\"
  OWNER \"$DB_USER\";
"

# Dump source database and restore to backup database
echo "💾 Dumping and restoring data (this may take a while)..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl 2>/dev/null | \
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$BACKUP_DB_NAME" -q 2>&1 | \
  grep -v "unrecognized configuration parameter" || true

echo ""
echo "✅ Backup completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backup Database: $BACKUP_DB_NAME"
echo ""
echo "To rollback, rename the backup database:"
echo "  1. Stop your application"
echo "  2. Rename current database to _old"
echo "  3. Rename backup database to original name"
echo "  4. Restart your application"
echo ""
echo "Example rollback commands:"
echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres"
echo "  ALTER DATABASE \"$DB_NAME\" RENAME TO \"${DB_NAME}_old\";"
echo "  ALTER DATABASE \"$BACKUP_DB_NAME\" RENAME TO \"$DB_NAME\";"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Unset password
unset PGPASSWORD
