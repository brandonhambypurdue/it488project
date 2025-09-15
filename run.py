# Imports the function that creates and configures the Flask app.
from app import create_app
from log.log import logger

# Calls the function to create an instance of Flask app.
# This also sets up routes, blueprints, and any other app settings.
app = create_app()

# This block runs only if the script is executed directly (not imported).
if __name__ == "__main__":
    try:
        # Starts the Flask development server.
        app.run(debug=True)
        logger.logDatabaseChange("Flask server started successfully")
    except Exception as e:
        logger.logFlaskError(f"Flask server failed to start: {str(e)}")
