# Imports SQLAlchemy's engine creation function.
from sqlalchemy import create_engine

# Imports the Base class from database module.
from database import Base  

# Import sqlite3 for direct SQL script execution.
import sqlite3


# Creates a SQLite engine connected to 'database.db'; echo=True enables SQL logging.
engine = create_engine("sqlite:///database.db", echo=True)

# Generates all tables defined in SQLAlchemy models.
Base.metadata.create_all(engine)


# Opens and executes the setup.sql file to initialize data.
try:
    
    with open("setup.sql", "r") as f:
        sql_script = f.read()

    # Connects to the SQLite database directly.
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    # Executes the entire SQL script.
    cursor.executescript(sql_script)

    # Commits changes and closes the connection.
    conn.commit()
    conn.close()

    # Confirms successful setup.
    print(" Database schema created and setup.sql applied.")

# Handles case where setup.sql is missing.
except FileNotFoundError:
    print(" setup.sql not found. Make sure it's in the same folder as init_db.py.")

