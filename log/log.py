# Imported Modules
import logging
import os
from datetime import datetime

# Initial Variables

# Classes
# ----------------------------
# CLASS: LOG
# ----------------------------
class LOG:
    # ----------------------------
    # FUNCTION: __init__
    # ----------------------------
    # Sets up three separate loggers:
    #   - database changes
    #   - database errors
    #   - flask errors
    def __init__(self, log_dir="log"):
        self.log_dir = log_dir
        os.makedirs(self.log_dir, exist_ok=True)

        # File paths
        self.database_log_file = os.path.join(self.log_dir, "database.log")
        self.database_error_log_file = os.path.join(self.log_dir, "database_error.log")
        self.flask_error_log_file = os.path.join(self.log_dir, "flask_error.log")

        # Loggers
        self.database_logger = self._create_logger("database_logger", self.database_log_file)
        self.database_error_logger = self._create_logger("database_error_logger", self.database_error_log_file)
        self.flask_error_logger = self._create_logger("flask_error_logger", self.flask_error_log_file)

    # ----------------------------
    # FUNCTION: _create_logger
    # ----------------------------
    def _create_logger(self, name, filepath):
        logger = logging.getLogger(name)
        logger.setLevel(logging.INFO)

        if not logger.handlers:
            handler = logging.FileHandler(filepath)
            formatter = logging.Formatter(
                "%(asctime)s - %(levelname)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        return logger

    # ----------------------------
    # FUNCTION: logDatabaseChange
    # ----------------------------
    def logDatabaseChange(self, message):
        self.database_logger.info(f"[DATABASE CHANGE] {message}")

    # ----------------------------
    # FUNCTION: logDatabaseError
    # ----------------------------
    def logDatabaseError(self, message):
        self.database_error_logger.error(f"[DATABASE ERROR] {message}")

    # ----------------------------
    # FUNCTION: logFlaskError
    # ----------------------------
    def logFlaskError(self, message):
        self.flask_error_logger.error(f"[FLASK ERROR] {message}")

# Functions

# Run
logger = LOG()