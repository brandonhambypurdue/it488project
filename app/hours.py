from flask import Blueprint, jsonify, request
from data.database import DATABASE, USERS
from sqlalchemy import text
from datetime import datetime

hours_bp = Blueprint("hours_bp", __name__)
db       = DATABASE()

KEY_MAP = {
    "sleep": "sleep", "study": "study", "hobby": "hobby",
    "meditation": "meditation", "journaling": "journaling",
    "self_reflection": "self_reflection", "stretching": "stretching",
    "hydration": "hydration", "lets_break_a_habit": "lets_break_a_habit"
}

def make_day_id(date_input):
    if isinstance(date_input, str):
        date_input = datetime.strptime(date_input, "%Y-%m-%d")
    start = datetime(date_input.year, 1, 1)
    return (date_input - start).days + 1

@hours_bp.route("/api/hours/input", methods=["POST"])
def input_hours():
    try:
        data = request.get_json(force=True)
        print("Received data:", data)

        username = data.get("username")
        date_str = data.get("date")
        habit    = data.get("habit")
        hours    = data.get("hours")

        if not username or not date_str or not habit or hours is None:
            return jsonify({"error": "Missing required fields"}), 400

        col = KEY_MAP.get(habit.strip().lower())
        if not col:
            return jsonify({"error": f"Unknown habit '{habit}'"}), 400

        # Lookup user
        user = db.session.query(USERS).filter_by(username=username).first()
        if not user:
            return jsonify({"error": f"User '{username}' not found"}), 404
        uid = user.id

        # Ensure table exists
        tbl = db.get_user_table(uid)
        if tbl is None:
            return jsonify({"error": "User habit table not found"}), 500
        if col not in tbl.c.keys():
            return jsonify({"error": f"Habit column '{col}' not found"}), 400

        # Compute day_id, month, day
        dt     = datetime.strptime(date_str, "%Y-%m-%d")
        day_id = make_day_id(dt)
        month  = f"{dt.month:02d}"
        day    = dt.day

        print(f"Upserting into user_{uid}: day_id={day_id}, {col}={hours}")

        # Upsert via raw SQL: insert or update in one go
        upsert = text(f"""
            INSERT INTO user_{uid} (day_id, month, day, {col})
            VALUES (:day_id, :month, :day, :hours)
            ON CONFLICT(day_id) DO UPDATE
              SET {col} = excluded.{col}
        """)
        db.session.execute(upsert, {
            "day_id": day_id,
            "month":  month,
            "day":    day,
            "hours":  hours
        })
        db.session.commit()

        return jsonify({"status": "saved"}), 200

    except Exception as e:
        db.session.rollback()
        print("Exception caught:", e)
        return jsonify({"error": str(e)}), 500
