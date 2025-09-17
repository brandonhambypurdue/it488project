# Imports necessary tools from Flask and Griffin's database setup.
# The Blueprint organizes routes; jsonify formats data as JSON.
from flask import Blueprint, jsonify, request
from data.database import DATABASE, USERS, HABITS
from log.log import logger

# Creates a web Blueprint called "main" to group related routes.
# main tells Flask where this blueprint lives.
main = Blueprint("main", __name__)

# Creates a database instance so data can be queried.
# This sets up a connection to the SQLite database and permits access to db.session.
db = DATABASE("data/database.db")


# Route to confirm Flask is running and connected to React.
# React can send a GET request to /api/ping and receive a JSON response.
@main.route("/api/ping", methods=["GET"])
def ping():
    return jsonify({"message": "Flask is running and ready to receive requests."})


# Route to receive habit data from React and store it in the database
@main.route("/api/input", methods=["POST"])
def input():
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        logger.logDatabaseChange(f"Received habit input: {data}")

        # looks up the user.
        user = db.session.query(USERS).filter_by(username=data.get("username")).first()
        if not user:
            logger.logDatabaseError(f"User '{data.get('username')}' not found when submitting habits")
            return jsonify({"error": f"User '{data.get('username')}' not found."}), 404

        # inserts each habit.
        for habit_name in data.get("habits", []):
            new_habit = HABITS(user_id=user.id, name=habit_name)
            db.session.add(new_habit)

        db.session.commit()
        logger.logDatabaseChange(f"Successfully saved habits for user '{user.username}'")
        return jsonify({"status": "saved", "received": data})

    except Exception as e:
        db.session.rollback()
        logger.logDatabaseError(f"Error saving habits: {str(e)}")
        return jsonify({"error": str(e)}), 500


# Route to authenticate user with username and password.
# React can send a POST request to /api/login with credentials.
@main.route("/api/login", methods=["POST"])
def login():
    try:
        # Extracts JSON data sent from React.
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        # Queries the USERS table to get the user record.
        user = db.session.query(USERS).filter_by(username=username).first()
        if not user:
            logger.logDatabaseError(f"Failed login attempt: User '{username}' not found")
            return jsonify({"success": False, "message": "User not found."}), 404

        # Compares provided password with stored password.
        if user.password != password:
            logger.logDatabaseError(f"Failed login attempt: Incorrect password for user '{username}'")
            return jsonify({"success": False, "message": "Incorrect password."}), 401

        # Retrieves habit data if credentials are valid.
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

        logger.logDatabaseChange(f"Successful login and habit retrieval for user '{username}'")

        # Returns habit data and login confirmation.
        return jsonify({
            "success": True,
            "username": username,
            "habits": habits_by_day
        })

    except Exception as e:
        logger.logFlaskError(f"Exception during login for user '{data.get('username', '')}': {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


# Route to get all weekly habits for a specific user.
# React can send a GET request to /api/habits/<username> to retrieve habit data.
@main.route("/api/habits/<username>", methods=["GET"])
def get_user_habits(username):
    try:
        # Queries the USERS table to get the user ID.
        user = db.session.query(USERS).filter_by(username=username).first()
        if not user:
            logger.logDatabaseError(f"User '{username}' not found when retrieving habits")
            return jsonify({"error": f"User '{username}' not found."}), 404

        uid = user.id
        days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        habits_by_day = []

        # Loops through each day and retrieves habit values.
        for day in days:
            sleep = db.getHabitValue(uid, day, "sleep")
            study = db.getHabitValue(uid, day, "study")
            hobby = db.getHabitValue(uid, day, "hobby")

            # If no data exists for the day, skip it.
            if sleep is None:
                continue

            # Appends structured habit data for the day.
            habits_by_day.append({
                "day": day,
                "sleep": sleep,
                "study": study,
                "hobby": hobby
            })

        logger.logDatabaseChange(f"Retrieved habits for user '{username}'")
        # Returns the full week's habit data as JSON.
        return jsonify({"username": username, "habits": habits_by_day})

    except Exception as e:
        logger.logFlaskError(f"Exception retrieving habits for user '{username}': {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
