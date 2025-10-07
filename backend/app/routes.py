# Imports needed.
from flask import Blueprint, jsonify, request
from data.database import DATABASE, USERS
from log.log import logger
from datetime import datetime, timedelta

# Blueprint and Database Initialization
main = Blueprint("main", __name__)
db   = DATABASE()
# Route for login. POST /api/login.
@main.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True)
        username = data.get("username")
        password = data.get("password")
        if not username or not password:
            return jsonify({"success": False, "message": "Missing credentials"}), 400

        user = db.session.query(USERS).filter_by(username=username).first()
        if not user:
            logger.logDatabaseError(f"Login failed: User '{username}' not found")
            return jsonify({"success": False, "message": "User not found"}), 404

        if user.password != password:
            logger.logDatabaseError(f"Login failed: Incorrect password for '{username}'")
            return jsonify({"success": False, "message": "Incorrect password"}), 401

 # Returns user info only; habits come from /api/daily, /api/weekly, /api/monthly.
        return jsonify({"success": True, "username": username}), 200

    except Exception as e:
        logger.logFlaskError(f"Exception in /api/login: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500
    
@main.route("/api/logout", methods=["POST"])
def logout():
    try:
        # Optional: clear session or token logic here
        logger.logInfo("User logged out successfully")
        return jsonify({"success": True, "message": "Logged out"}), 200
    except Exception as e:
        logger.logFlaskError(f"Exception in /api/logout: {e}")
        return jsonify({"success": False, "message": "Logout failed"}), 500





 # Route to GET /api/test_db.
@main.route("/api/test_db", methods=["GET"])
def test_db():
    import os, traceback

    results = {
        "working_directory": os.getcwd(),
        "database_info": {},
        "users": [],
        "errors": []
    }
    try:
        results["database_info"]["db_object_path"] = str(db.engine.url)
        all_users = db.session.query(USERS).all()
        results["database_info"]["total_users"] = len(all_users)

        for u in all_users:
            pwd = u.password or ""
            results["users"].append({
                "id": u.id,
                "username": u.username,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "password_length": len(pwd),
                "password_preview": pwd[:5] + ("..." if pwd else "")
            })

        test_user = db.session.query(USERS).filter_by(username="TestUser1").first()
        results["test_user_found"]    = bool(test_user)
        results["test_user_password"] = test_user.password if test_user else None

    except Exception as e:
        results["errors"].append(str(e))
        results["errors"].append(traceback.format_exc())

    return jsonify(results), 200