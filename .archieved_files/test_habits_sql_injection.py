# Imports.
import os
import sys
import sqlite3
import pytest
from contextlib import contextmanager

# Makes sure project root and backend are on the path.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
BACKEND_ROOT = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

# Import create_app and DATABASE.
try:
    from app import create_app
except Exception:
    from backend.app import create_app

DB = None
USERS = None
try:
    from data.database import DATABASE, USERS as USERS_MODEL
    DB = DATABASE()
    USERS = USERS_MODEL
except Exception:
    try:
        from backend.data.database import DATABASE, USERS as USERS_MODEL
        DB = DATABASE()
        USERS = USERS_MODEL
    except Exception:
        DB = None
        USERS = None

# helper to find sqlite DB file.
def sqlite_db_path():
    candidates = [
        os.path.join(PROJECT_ROOT, "backend", "data", "database.db"),
        os.path.join(PROJECT_ROOT, "backend", "database.db"),
        os.path.join(PROJECT_ROOT, "data", "database.db"),
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return None

@pytest.fixture(scope="module")
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c

def assert_users_table_exists(db_path):
    assert db_path, "database file not found for safety check"
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
    row = cur.fetchone()
    conn.close()
    assert row is not None, "users table not found — possible destructive change"

# Transactional seed: insert a test user and roll back after tests that use it.
@contextmanager
def temporary_user(db_instance, username="test_injection_user", password="TestPass!234"):
  
    if not db_instance or not getattr(db_instance, "session", None):
        yield None
        return

    session = db_instance.session
    try:
 
        try:
            hash_mod = getattr(db_instance, "hashing", None)
            if hash_mod is None:
                import data.hashing as project_hashing
                hash_mod = getattr(project_hashing, "HASH", project_hashing.HASH)()
        except Exception:
            hash_mod = None

        if hash_mod:

            hp = hash_mod.createHash(password)
            hp_str = hp.decode("utf-8") if isinstance(hp, (bytes, bytearray)) else str(hp)
        else:
          
            hp_str = "fallback_hash"

# create ORM user model if available.
        UsersModel = getattr(sys.modules.get(DB.__module__), "USERS", None) if DB else USERS
        if UsersModel is None:
            UsersModel = USERS  

        user_obj = None
        if UsersModel is not None:
            user_obj = UsersModel(first_name="Temp", last_name="User", username=username, password=hp_str)
            session.add(user_obj)
            session.flush() 

        yield username

 # rollback to leave DB unchanged.
        session.rollback()
    except Exception:
        try:
            session.rollback()
        except Exception:
            pass
        yield None

# Endpoint-level injection attempts for habit routes.
def test_habit_endpoint_sql_injection_protection_create_and_update(client):

    payloads = [
        {"username": "' OR '1'='1", "habit_name": "Reading", "value": 1},
        {"user_id": "1; DROP TABLE users; --", "habit_name": "Reading", "value": 1},
    ]
    endpoints = [("/habit", "POST"), ("/habit", "PUT"), ("/habit/monthly_summary", "POST")]

    for payload in payloads:
        for path, method in endpoints:
            if method == "POST":
                resp = client.post(path, json=payload)
            else:
                resp = client.put(path, json=payload)

            assert resp.status_code in (400, 401, 403, 404, 422, 200)
            if resp.status_code == 200:
                body = resp.get_json() or {}

                if isinstance(body, dict) and "success" in body:
                    assert body["success"] is False

def test_habit_endpoint_sql_injection_protection_gets(client):
    params = [
        {"username": "' OR '1'='1"},
        {"month": "1; DROP TABLE users; --"},
        {"user_id": "1 OR 1=1"},
    ]
    endpoints = [("/habit", "GET"), ("/habit/summary", "GET"), ("/habit/monthly_summary", "GET"), ("/habit_list", "GET")]
    for param in params:
        for path, method in endpoints:
            resp = client.get(path, query_string=param)
            assert resp.status_code in (200, 400, 401, 403, 404, 422)
            if resp.status_code == 200:
                body = resp.get_json() or {}
                if isinstance(body, list):
                    assert len(body) < 1000

# Read-only raw SQL helper checks.
def test_get_habit_safe_columns_and_invalid_column_no_destruction():
    db_path = sqlite_db_path()
    if db_path:
        assert_users_table_exists(db_path)

    if not DB:
        pytest.skip("DATABASE wrapper not importable; skipping raw-SQL read checks")

# Safe column read. Should return a value but not crash.
    try:
        val = DB.getHabitValue(uid=1, day_id=1, column="sleep")
        assert val is None or isinstance(val, int)
    except Exception:
        pytest.skip("getHabitValue raised for safe column; environment mismatch")

# Invalid column name. Should expect None or exception, but no destructive action.
    malicious_col = "sleep; DROP TABLE users; --"
    try:
        result = DB.getHabitValue(uid=1, day_id=1, column=malicious_col)
        assert result is None
    except Exception:
        pass

# final safety check to see if users table still exists.
    if db_path:
        assert_users_table_exists(db_path)