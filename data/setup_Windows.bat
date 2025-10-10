
@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM Exit on error (stop if any command fails)
SET ERRLEV=0

SET "PROJECT_NAME=IT488 - Routine Tracker Database Backend"
SET "APP_NAME=Routine Tracker"
SET "DB_FILE=database.db"
SET "SQL_SCRIPT=setup.sql"

echo [*] Project: %PROJECT_NAME%
echo [*] Application: %APP_NAME%

REM Check if database file exists
IF EXIST "%DB_FILE%" (
    echo [*] Existing database found. Deleting %DB_FILE%...
    del "%DB_FILE%"
)

REM Create Database from SQL Script
echo [*] Creating new database from %SQL_SCRIPT%...
sqlite3 "%DB_FILE%" < "%SQL_SCRIPT%"

echo [*] Database creation complete: %DB_FILE%

ENDLOCAL