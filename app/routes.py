# Imports necessary tools from Flask and Griffin's database setup.
# The Blueprint organizes routes; jsonify formats data as JSON.
from flask import Blueprint, jsonify, request
from data.database import DATABASE, USERS, HABITS

# Creates a web Blueprint called "main" to group related routes.
# main tells Flask where this blueprint lives.
main = Blueprint("main", __name__)

# Creates a database instance so data can be queried.
# This sets up a connection to the SQLite database and permits access to db.session.
db = DATABASE("../data/database.db")


# Route to confirm Flask is running and connected to React.
# React can send a GET request to /api/ping and receive a JSON response.
@main.route("/api/ping", methods=["GET"])
def ping():
    return jsonify({"message": "Flask is running and ready to receive requests."})


# Route to receive data from React via POST request.
# React can send JSON to /api/input and Flask will process it.
@main.route("/api/input", methods=["POST"])
def input():
    # Extracts JSON data sent from React.
    data = request.get_json()

    # Logs the received data to the terminal.
    print(f"Received data: {data}")

    # Returns a confirmation message with the received data.
    return jsonify({"status": "success", "received": data})


# Route to get all weekly habits for a specific user.
# React can send a GET request to /api/habits/<username> to retrieve habit data.
@main.route("/api/habits/<username>", methods=["GET"])
def get_user_habits(username):
    # Queries the USERS table to get the user ID.
    user = db.session.query(USERS).filter_by(username=username).first()
    if not user:
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

    # Returns the full week's habit data as JSON.
    return jsonify({"username": username, "habits": habits_by_day})


