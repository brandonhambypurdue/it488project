# Imports necessary tools from Flask and Griffin's database setup.
# The Blueprint organizes routes; jsonify formats data as JSON.
from flask import Blueprint, jsonify, request
from data.database import DATABASE, USERS, HABITS
from log.log import logger

# Makes reminders blueprint to store reminder or pop-up routes.
reminders_bp = Blueprint("reminders_bp", __name__)

# Creates a database instance so data can be queried.
db = DATABASE("data/database.db")

