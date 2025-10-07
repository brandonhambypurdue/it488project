# Imports needed.
from flask import Flask
from flask_cors import CORS
from data.database import Session

# Application factory.
def create_app():
    # Create Flask app and enable CORS
    app = Flask(__name__)
    CORS(app)

# Registers blueprints.
    from app.routes    import main       as main_bp
    from app.habits    import habits_bp
    from app.reminders import reminders_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(habits_bp)
    app.register_blueprint(reminders_bp)

# Teardown handler: remove SQLAlchemy session after each request
    @app.teardown_appcontext
    def shutdown_session(exception=None):
        Session.remove()
        

    for rule in app.url_map.iter_rules():
        print(rule)

# Return configured app instance
    return app