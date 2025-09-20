# Imports the Flask class needed to communicate with React and Griffin's database.
from flask import Flask
 # Enables cross-origin requests from React.
from flask_cors import CORS  

# Defines a function that sets up and returns the Flask app.
def create_app():
    # Creates a new Flask app instance.
    app = Flask(__name__)

    # Enable CORS so React (running on a different port) can talk to Flask.
    CORS(app)

    # Imports the 'main' blueprint from the routes module.
    # So routes are organized in a separate file.
    from .routes import main

   # Registers the main routes blueprint 
    from .routes import main                          
    app.register_blueprint(main)                      

    # Registers the habits blueprint.
    from .habits import habits_bp                      
    app.register_blueprint(habits_bp)  

    # Registers the reminders blueprint.
    from .reminders import reminders_bp            
    app.register_blueprint(reminders_bp)

    # Returns the configured Flask app so it can be run.
    return app

