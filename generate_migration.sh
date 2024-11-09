#!/bin/bash

# Script to auto-generate Prisma migration with custom naming
# Usage: ./generate_migration.sh "migration_name"

# Check if migration name is provided
if [ -z "$1" ]; then
  echo "Please provide a migration name as the first argument."
  echo "Usage: ./generate_migration.sh \"migration_name\""
  exit 1
fi

# Migration name from first argument
MIGRATION_NAME=$1
# Migration directory path
MIGRATION_DIR="migrations"
# Prisma schema path
SCHEMA_PATH="./prisma/schema.prisma"
# Define timestamp for unique migration folder
TIMESTAMP=$(date +"%Y%m%d%H%M%S")


# Check if migration directory exists; if not, create it
if [ ! -d "$MIGRATION_DIR" ]; then
  mkdir -p "$MIGRATION_DIR"
fi

# Check if the migration directory contains any .sql files
if [ -z "$(find "$MIGRATION_DIR" -type f -name "*.sql")" ]; then
  echo "No existing migrations found in $MIGRATION_DIR."
else
  echo "Existing migration files found in $MIGRATION_DIR."
fi



# Generate migration using Prisma migrate diff
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel "$SCHEMA_PATH" \
  --script \
  --output "$MIGRATION_DIR/${MIGRATION_NAME}.sql"

# Check if the migration was created successfully
if [ $? -eq 0 ]; then
  echo "Migration created successfully: $MIGRATION_DIR/${MIGRATION_NAME}.sql"
else
  echo "Failed to create migration."
fi
