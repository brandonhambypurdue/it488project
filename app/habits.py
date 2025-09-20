# Imports necessary tools from Flask and Griffin's database setup.
# The Blueprint organizes routes; jsonify formats data as JSON.
from flask import Blueprint, jsonify, request                     
from data.database import DATABASE, USERS, HABITS                
from log.log import logger                                       

# Makes habit blueprint to store habit routes.
habits_bp = Blueprint("habits_bp", __name__)                     

# Creates a database instance so data can be queried.
db = DATABASE("data/database.db")                                

# Route to receive habit data from React and store it in the database.
@habits_bp.route("/api/input", methods=["POST"])                  
def input():                                                     
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        logger.logDatabaseChange(f"Received habit input: {data}")

        user = db.session.query(USERS).filter_by(username=data.get("username")).first()
        if not user:
            logger.logDatabaseError(f"User '{data.get('username')}' not found when submitting habits")
            return jsonify({"error": f"User '{data.get('username')}' not found."}), 404

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


# Route to get all weekly habits for a specific user.
@habits_bp.route("/api/habits/<username>", methods=["GET"])      
def get_user_habits(username):                                   
    try:
        user = db.session.query(USERS).filter_by(username=username).first()
        if not user:
            logger.logDatabaseError(f"User '{username}' not found when retrieving habits")
            return jsonify({"error": f"User '{username}' not found."}), 404

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
# Logs habit retrieval or error, then returns JSON response.
        logger.logDatabaseChange(f"Retrieved habits for user '{username}'")
        return jsonify({"username": username, "habits": habits_by_day})

    except Exception as e:
        logger.logFlaskError(f"Exception retrieving habits for user '{username}': {str(e)}")
        return jsonify({"error": "Internal server error"}), 500