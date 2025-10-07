# Import the application factory.
from app import create_app

# Import logger for application event logging.
from log.log import logger

app = create_app()

# Ensure this block runs only when the script is executed directly.
if __name__ == "__main__":
# Wrap the server startup in a try-except to catch any errors.
    try:
# Start the Flask development server.
      
        app.run(debug=True, threaded=False)
       
        logger.logDatabaseChange("Flask server started successfully")
# Catch exceptions raised during server startup.
    except Exception as e:
# Log the error if the Flask server fails to start
        logger.logFlaskError(f"Flask server failed to start: {e}")