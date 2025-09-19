# Imports necessary tools from Flask and Griffin's database setup.
# The Blueprint organizes routes; jsonify formats data as JSON.
from flask import Blueprint, jsonify, request
from data.database import DATABASE, USERS, HABITS
from log.log import logger

# Creates a Blueprint called "main" to group related routes.
# Main tells Flask where the blueprint lives.
main = Blueprint("main", __name__)

# Creates a database instance so data can be queried.
db = DATABASE("data/database.db")

# Route to confirm Flask is running and connected to React.
# React can send a GET request to /api/ping and receive a JSON response.
@main.route("/api/ping", methods=["GET"])
def ping():
    return jsonify({"message": "Flask is running and ready to receive requests."})

# Route to authenticate user with username and password.
# React can send a POST request to /api/login with credentials.
@main.route("/api/login", methods=["POST"])
def login():
    try:
    
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        user = db.session.query(USERS).filter_by(username=username).first()
        if not user:
            logger.logDatabaseError(f"Failed login attempt: User '{username}' not found")
            return jsonify({"success": False, "message": "User not found."}), 404

        if user.password != password:
            logger.logDatabaseError(f"Failed login attempt: Incorrect password for user '{username}'")
            return jsonify({"success": False, "message": "Incorrect password."}), 401

        uid = user.id
        days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        habits_by_day = []

        for day in days:
            sleep = db.getHabitValue(uid, day, "sleep")
            study = db.getHabitValue(uid, day, "study")
            hobby = db.getHabitValue(uid, day, "hobby")

            if sleep is None:
                continue

            habits_by_day.append({
                "day": day,
                "sleep": sleep,
                "study": study,
                "hobby": hobby
            })
# Logs confirmation of user login and habit data retrieval.
        logger.logDatabaseChange(f"Successful login and habit retrieval for user '{username}'")

# Returns habit data and login confirmation.
        return jsonify({
            "success": True,
            "username": username,
            "habits": habits_by_day
        })
#  Logs exception and returns a 500 error response.
    except Exception as e:
        logger.logFlaskError(f"Exception during login for user '{data.get('username', '')}': {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500
