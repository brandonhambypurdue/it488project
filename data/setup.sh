#!/bin/bash

# Exit on error
set -e

PROJECT_NAME="IT488 - Routine Tracker Database Backend"
APP_NAME="Routine Tracker"
DB_FILE="database.db"
SQL_SCRIPT="setup.sql"

echo "[*] Project: $PROJECT_NAME"
echo "[*] Application: $APP_NAME"

# Check if database file exists
if [ -f "$DB_FILE" ]; then
    echo "[*] Existing database found. Deleting $DB_FILE..."
    rm "$DB_FILE"
fi

# Create Database from SQL Script
echo "[*] Creating new database from $SQL_SCRIPT..."
sqlite3 "$DB_FILE" < "$SQL_SCRIPT"

echo "[*] Database creation complete: $DB_FILE"
