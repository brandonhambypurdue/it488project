#!/bin/bash

# Exit on error
set -e

PROJECT_NAME="IT488 - Routine Tracker Database Backend"
APP_NAME="Routine Tracker"

echo "[*] Project: $PROJECT_NAME"
echo "[*] Application: $APP_NAME"

cd ..

# Create virtual environment
echo "[*] Creating virtual environment..."
python3 -m venv venv_Linux

# Activate virtual environment
echo "[*] Activating virtual environment..."
source venv_Linux/bin/activate

# Upgrade pip
echo "[*] Upgrading pip..."
pip install --upgrade pip

# Install required Python packages
echo "[*] Installing Python dependencies..."
pip install SQLAlchemy
pip install blinker
pip install click
pip install colorama
pip install Flask
pip install greenlet
pip install itsdangerous
pip install Jinja2
pip install MarkupSafe
pip install typing_extensions
pip install Werkzeug
pip install flask-cors
pip install bcrypt
pip install cryptography

# Run the test script
echo "[*] Running unit test script..."
python run.py