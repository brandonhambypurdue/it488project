@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM Exit on error (stop if any command fails)
SET ERRLEV=0

SET "PROJECT_NAME=IT488 - Routine Tracker Database Backend"
SET "APP_NAME=Routine Tracker"

echo [*] Project: %PROJECT_NAME%
echo [*] Application: %APP_NAME%

cd ..

REM Create virtual environment
echo [*] Creating virtual environment...
py -m venv venv_Windows

REM Activate virtual environment
echo [*] Activating virtual environment...
CALL venv_Windows\Scripts\activate.bat

REM Upgrade pip
echo [*] Upgrading pip...
pip install --upgrade pip

REM Install required Python packages
echo [*] Installing Python dependencies...
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

REM Run the test script
echo [*] Running unit test script...
py run.py

ENDLOCAL