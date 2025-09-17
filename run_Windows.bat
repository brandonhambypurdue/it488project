@echo off

rem Launch backend script in its own window
cd backend\venv_Windows\
start "" cmd /c venv.bat

rem Move to frontend folder
cd ..\..
cd frontend

rem Check if node_modules exists
if not exist node_modules (
    echo node_modules folder not found, running npm install...
    call npm install
) else (
    echo node_modules folder already exists, skipping npm install.
)

rem Check if axios is installed
if not exist node_modules\axios (
    echo axios not found, installing axios...
    call npm install axios
) else (
    echo axios already installed, skipping.
)

rem Start frontend app
call npm start

rem Keep the main window open
pause
