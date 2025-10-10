from flask import Blueprint, jsonify, request
from data.database import DATABASE, USERS
from log.log import logger
from datetime import datetime, timedelta
from sqlalchemy import text

# Blueprint setup and database initialization
habits_bp = Blueprint("habits_bp", __name__)
db = DATABASE()

# Converts a date string (YYYY-MM-DD) or datetime object into day_id 1–365
def make_day_id(date_input):
    if isinstance(date_input, str):
        date_input = datetime.strptime(date_input, "%Y-%m-%d")
    start = datetime(date_input.year, 1, 1)
    return (date_input - start).days

# Shared logic to fetch last 7 days of habits
def fetch_user_habits(username):
    user = db.session.query(USERS).filter_by(username=username).first()
    if not user:
        return None, jsonify({"error": f"User '{username}' not found"}), 404

    uid = user.id
    today = datetime.today()

    # Step 1: Get Monday of the current week
    weekday = today.weekday()  # Monday = 0, Sunday = 6
    monday = today - timedelta(days=weekday)

    result = []

    # Step 2: Loop through Monday to Sunday
    for i in range(7):
        date = monday + timedelta(days=i)
        day_id = make_day_id(date) + 1 
        name = date.strftime("%A")

        sleep = db.getHabitValue(uid, day_id, "sleep")
        study = db.getHabitValue(uid, day_id, "study")
        hobby = db.getHabitValue(uid, day_id, "hobby")
        meditation = db.getHabitValue(uid, day_id, "meditation")
        journaling = db.getHabitValue(uid, day_id, "journaling")
        self_reflection = db.getHabitValue(uid, day_id, "self_reflection")
        stretching = db.getHabitValue(uid, day_id, "stretching")
        cardio = db.getHabitValue(uid, day_id, "cardio")
        hydration = db.getHabitValue(uid, day_id, "hydration")
        lets_break_a_habit = db.getHabitValue(uid, day_id, "lets_break_a_habit")


        logger.logDatabaseChange(
            f"Queried day_id={day_id} ({name}) -> sleep={sleep}, study={study}, hobby={hobby}"
        )

        result.append({
            "day": name,
            "day_id": day_id,
            "sleep": sleep,
            "study": study,
            "hobby": hobby,
            "meditation": meditation,
            "journaling": journaling,
            "self_reflection": self_reflection,
            "stretching": stretching,
            "cardio":cardio,
            "hydration":hydration,
            "lets_break_a_habit":lets_break_a_habit
            
        })

    return {"username": username, "habits": result}, None, 200


# NEW: Weekly summary logic
from sqlalchemy import text

from sqlalchemy import text
from datetime import datetime, timedelta
from collections import defaultdict

def fetch_weekly_summary(username):
    try:
        # Step 1: Look up user ID from users table
        user_row = db.session.execute(
            text("SELECT id FROM users WHERE username = :username"),
            {"username": username}
        ).fetchone()

        if not user_row:
            return None, jsonify({"error": "User not found"}), 404

        table_name = f"user_{user_row.id}"

        # Step 2: Pull all October logs
        query = text(f"""
            SELECT day_id, sleep, study, hobby, meditation, journaling,
                   self_reflection, stretching, hydration, lets_break_a_habit
            FROM {table_name}
            WHERE month = 10;
        """)
        rows = db.session.execute(query).fetchall()

        # Step 3: Build calendar-aware week buckets
        def get_october_weeks(year=2025):
            weeks = []
            start = datetime(year, 10, 1)
            end = datetime(year, 10, 31)
            current = start
            while current <= end:
                week_start = current
                week_end = week_start + timedelta(days=(6 - week_start.weekday()))
                if week_end > end:
                    week_end = end
                weeks.append((week_start.date(), week_end.date()))
                current = week_end + timedelta(days=1)
            return weeks

        weeks = get_october_weeks()
        weekly_data = defaultdict(lambda: {
            "sleep": 0, "study": 0, "hobby": 0, "meditation": 0,
            "journaling": 0, "self_reflection": 0, "stretching": 0,
            "hydration": 0, "lets_break_a_habit": 0, "daysLogged": 0
        })

        # Step 4: Assign each row to a week bucket
        for row in rows:
            date = datetime(2025, 1, 1) + timedelta(days=row.day_id - 1)
            for start, end in weeks:
                if start <= date.date() <= end:
                    key = f"{start} to {end}"
                    weekly_data[key]["sleep"] += row.sleep or 0
                    weekly_data[key]["study"] += row.study or 0
                    weekly_data[key]["hobby"] += row.hobby or 0
                    weekly_data[key]["meditation"] += row.meditation or 0
                    weekly_data[key]["journaling"] += row.journaling or 0
                    weekly_data[key]["self_reflection"] += row.self_reflection or 0
                    weekly_data[key]["stretching"] += row.stretching or 0
                    weekly_data[key]["hydration"] += row.hydration or 0
                    weekly_data[key]["lets_break_a_habit"] += row.lets_break_a_habit or 0

                    if sum([
                        row.sleep or 0,
                        row.study or 0,
                        row.hobby or 0,
                        row.meditation or 0,
                        row.journaling or 0,
                        row.self_reflection or 0,
                        row.stretching or 0,
                        row.hydration or 0,
                        row.lets_break_a_habit or 0
                        ]) > 0:


                        weekly_data[key]["daysLogged"] += 1
                    break

        # Step 5: Format result
        weekly = [
            {"weekRange": label, **data}
            for label, data in sorted(weekly_data.items())
        ]

        return weekly, None, 200

    except Exception as e:
        return None, jsonify({"error": "Internal server error", "details": str(e)}), 500
def fetch_monthly_summary(username):
    try:
        # 1. Find the user record
        user = db.session.query(USERS).filter_by(username=username).first()
        if not user:
            return None, jsonify({"error": "user not found"}), 404

        # 2. Build the dynamic table name (e.g. user_1, user_2, etc.)
        table_name = f"user_{user.id}"

        # 3. Raw SQL query to aggregate by month
        sql = text(f"""
            SELECT 
                month,
                SUM(sleep) as sleep,
                SUM(study) as study,
                SUM(hobby) as hobby,
                SUM(meditation) as meditation,
                SUM(journaling) as journaling,
                SUM(self_reflection) as self_reflection,
                SUM(stretching) as stretching,
                SUM(hydration) as hydration,
                SUM(lets_break_a_habit) as lets_break_a_habit
            FROM {table_name}
            GROUP BY month
            ORDER BY month
        """)

        results = db.session.execute(sql).mappings().all()

        # 4. Convert into the shape MonthsHolder expects
        monthly_totals = {}
        for row in results:
            month_key = f"{int(row['month']):02d}"  # ensure "01", "02", etc.
            monthly_totals[month_key] = {
                "sleep": row["sleep"] or 0,
                "study": row["study"] or 0,
                "hobby": row["hobby"] or 0,
                "meditation": row["meditation"] or 0,
                "journaling": row["journaling"] or 0,
                "self_reflection": row["self_reflection"] or 0,
                "stretching": row["stretching"] or 0,
                "hydration": row["hydration"] or 0,
                "lets_break_a_habit": row["lets_break_a_habit"] or 0,
            }

        return monthly_totals, None, 200

    except Exception as e:
        import traceback
        print("❌ Error in fetch_monthly_summary:", e)
        print(traceback.format_exc())
        return None, jsonify({"error": "internal server error"}), 500


    try:
        # 1. Find the user
        user = db.session.query(USERS).filter_by(username=username).first()
        if not user:
            return None, jsonify({"error": "user not found"}), 404

        # 2. Get all daily habit entries for that user
        daily_entries = db.session.query(DailyHabit).filter_by(user_id=user.id).all()

        # 3. Aggregate into month buckets
        monthly_totals = {}
        for entry in daily_entries:
            # assume entry.date is a datetime
            month_key = entry.date.strftime("%m")  # "01", "02", ...
            if month_key not in monthly_totals:
                monthly_totals[month_key] = {
                    "study": 0, "sleep": 0, "hobby": 0,
                    "meditation": 0, "journaling": 0,
                    "self_reflection": 0, "stretching": 0,
                    "hydration": 0, "lets_break_a_habit": 0
                }

            monthly_totals[month_key]["study"] += entry.study or 0
            monthly_totals[month_key]["sleep"] += entry.sleep or 0
            monthly_totals[month_key]["hobby"] += entry.hobby or 0
            monthly_totals[month_key]["meditation"] += entry.meditation or 0
            monthly_totals[month_key]["journaling"] += entry.journaling or 0
            monthly_totals[month_key]["self_reflection"] += entry.self_reflection or 0
            monthly_totals[month_key]["stretching"] += entry.stretching or 0
            monthly_totals[month_key]["hydration"] += entry.hydration or 0
            monthly_totals[month_key]["lets_break_a_habit"] += entry.lets_break_a_habit or 0

        return monthly_totals, None, 200

    except Exception as e:
        return None, jsonify({"error": "internal server error"}), 500

# POST /api/input: submit habit data
@habits_bp.route("/api/input", methods=["POST"])
def input_habits():
    KEY_MAP = {
        "sleep": "sleep", "study": "study", "hobby": "hobby",
        "Meditation": "meditation", "Journaling": "journaling",
        "Self reflection": "self_reflection", "Stretching": "stretching",
        "Cardio": "hobby", "Hydration": "hydration", "Random": "lets_break_a_habit"
    }
    try:
        data = request.get_json(force=True)
        username = data.get("username")
        date_str = data.get("date")
        habits = data.get("habits")

        if not username or not date_str or not isinstance(habits, dict):
            return jsonify({"error": "username, date, and habits dict required"}), 400

        user = db.session.query(USERS).filter_by(username=username).first()
        if not user:
            return jsonify({"error": f"User '{username}' not found"}), 404

        uid = user.id
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        day_id = make_day_id(dt)
        month = f"{dt.month:02d}"
        day = dt.day

        payload = {col: habits[label] for label, col in KEY_MAP.items() if label in habits}
        if not payload:
            return jsonify({"error": "No valid habit keys found"}), 400

        if not db.addHabit(uid, day_id, month, day, **payload):
            return jsonify({"error": "Failed to save habits"}), 500

        return jsonify({"status": "saved"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500

# GET /api/habits/<username>: retrieve last 7 days of habits
@habits_bp.route("/api/habits/<username>", methods=["GET"])
def get_user_habits(username):
    user = db.session.query(USERS).filter_by(username=username).first()
    if not user:
        return jsonify({"error": f"User '{username}' not found"}), 404

    result, error_resp, status = fetch_user_habits(username)
    if error_resp:
        return error_resp, status

    return jsonify({
        "username": username,
        "first_name": user.first_name,
        "habits": result
    }), status

# GET /api/daily: shim for daily habits
@habits_bp.route("/api/daily", methods=["GET"])
def daily_habits():
    username = request.args.get("username")
    if not username:
        return jsonify({"error": "username query param required"}), 400
    result, error_resp, status = fetch_user_habits(username)
    if error_resp:
        return error_resp, status
    return jsonify({"username": username, "habits": result}), status

# UPDATED: GET /api/weekly returns true weekly summaries
@habits_bp.route("/api/weekly", methods=["GET"])
def weekly_habits():
    username = request.args.get("username")
    if not username:
        return jsonify({"error": "username query param required"}), 400
    result, error_resp, status = fetch_weekly_summary(username)
    if error_resp:
        return error_resp, status
    return jsonify({"success": True, "username": username, "weekly": result}), status

# GET /api/monthly: return true monthly summaries
@habits_bp.route("/api/monthly", methods=["GET"])
def monthly_habits():
    username = request.args.get("username")
    if not username:
        return jsonify({"error": "username query param required"}), 400

    result, error_resp, status = fetch_monthly_summary(username)
    if error_resp:
        return error_resp, status

    return jsonify({
        "success": True,
        "username": username,
        "monthly": result
    }), status


# GET /api/dropdown-options: list habit dropdown options
@habits_bp.route("/api/dropdown-options", methods=["GET"])  
def dropdown_options():
    return jsonify({
        "success": True,
        "options": [
            "sleep", "study", "hobby",
            "meditation", "journaling", "self_reflection",
            "stretching", "hydration", "lets_break_a_habit"
        ]
    }), 200




# POST /api/habit/create: create a new habit entry with default 0
@habits_bp.route("/api/habit/create", methods=["POST"])
def create_habit_from_dropdown():
    KEY_MAP = {
        "Meditation": "meditation", "Journaling": "journaling",
        "Self reflection": "self_reflection", "Stretching": "stretching",
        "Cardio": "hobby", "Hydration": "hydration", "Random": "lets_break_a_habit"
    }
    try:
        data = request.get_json(force=True)
        username = data.get("username")
        habitName = data.get("habit")

        if not username or not habitName:
            return jsonify({"success": False, "message": "username and habit required"}), 400

        user = db.session.query(USERS).filter_by(username=username).first()
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        db_field = KEY_MAP.get(habitName)
        if not db_field:
            return jsonify({"success": False, "message": f"Unknown habit '{habitName}"}), 400

        uid = user.id
        today = datetime.today()
        day_id = make_day_id(today)
        month = f"{today.month:02d}"
        day = today.day

        if not db.addHabit(uid, day_id, month, day, **{db_field: 0}):
            return jsonify({"success": False, "message": "Failed to create habit"}), 500

        return jsonify({"success": True, "habit": habitName}), 200

    except Exception:
        db.session.rollback()
        return jsonify({"success": False, "message": "Internal server error"}), 500






