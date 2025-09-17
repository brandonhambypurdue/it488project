# IT488 - Routine Machine

## Overview
The application will be called Routine Machine. It is a habit-tracking system designed to help users build positive routines while breaking negative ones. The app allows users to set and monitor personalized goals, receive reminders to stay consistent, and visualize their progress through interactive 2D graphs. Routine Machine also includes features such as streak tracking, milestone adjustments, and reflective insights to encourage long-term growth. By analyzing user patterns, the system helps individuals refine their routines and set new goals as progress is achieved, making daily focus and self-improvement easier and more engaging.

## File Structure
```
Project Folder/
├── README.md
├── run_Windows.bat
├── run_Linux.sh
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package-lock.json
│   └── package.json
└──  backend/
    ├── app/
    ├── data/
    ├── log/
    ├── venv_Windows/
    ├── venv_Linux/
    ├── .archieved_files/
    └── run.py
```

## Frontend
This app runs currently in development mode using the URL, http://localhost:3000 in the browser.  This page will automatically open when using `npm start`.

## Backend
This app runs on a Python server framework called Flask and uses SQLAlchemy for the database layer.  Run the perspective `venv` script from either `venv_Windows` or `venv_Linux` based on your operating system.

## Running the Application
In order to run the application for development and testing, you will need a couple of pre-requists installed:
- `Node.js`: An open-source JavaScript runtime environment to allow JavaScript to be ran outside of the browser.
- `SQLite`: A lightweight serverless database engine.
- `Python3`: A high-level programming language used for the backend code base.
<br>To start both the frontend and backend, just run the `run_Windows.bat` or `run_Linux.sh` based on your operating system.  This script will open the Python backend server in a separate window and start the frondend portion.
<br>*Warning: DO NOT MOVE FILES OR SCRIPTS.  THIS IS ALREADY SETUP TO JUST CLONE THE MAIN BRANCH AND RUN THE ENTIRE APPLICATION FROM SPRINT 1.*

## Update Frontend and Backend Branches
In order to update the branches for frontend and backend in the future in the event of changes.  Just use the following commands from the project folder:
```
cd frontend `(or backend)`
git checkout Sprint1-Frontend (or adjacent branch name)
```