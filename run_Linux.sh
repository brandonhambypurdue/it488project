#!/bin/bash

# Launch backend script in its own window (background)
cd backend/venv_Linux/ || exit
./venv.sh &

# Move to frontend folder
cd ../..
cd frontend || exit

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "node_modules folder not found, running npm install..."
    npm install
else
    echo "node_modules folder already exists, skipping npm install."
fi

# Check if axios is installed
if [ ! -d "node_modules/axios" ]; then
    echo "axios not found, installing axios..."
    npm install axios
else
    echo "axios already installed, skipping."
fi

# Start frontend app
npm start

# Keep the script open (optional)
read -p "Press [Enter] to close..."
