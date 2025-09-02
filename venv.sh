#!/bin/bash

# Exit on error
set -e

PROJECT_NAME="IT488 - Routine Tracker Database Backend"
APP_NAME="Routine Tracker"

echo "[*] Project: $PROJECT_NAME"
echo "[*] Application: $APP_NAME"

# Create virtual environment
echo "[*] Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "[*] Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "[*] Upgrading pip..."
pip install --upgrade pip

# Install required Python packages
echo "[*] Installing Python dependencies..."
pip install SQLAlchemy

# Run the test script
echo "[*] Running unit test script..."
python test.py
