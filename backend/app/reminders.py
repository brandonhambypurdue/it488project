# Imports needed.
from flask import Blueprint, jsonify

# Blueprint setup for reminders endpoints.
reminders_bp = Blueprint("reminders_bp", __name__)

# route for reminders popup. GET /api/reminders
# Returns a JSON list of reminders.
@reminders_bp.route("/api/reminders", methods=["GET"])
def get_reminders():
# Stub implementation until reminders are added
    return jsonify({"reminders": []}), 200