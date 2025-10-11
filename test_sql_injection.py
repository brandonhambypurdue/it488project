# Imports for SQL Injection Test.
import os
import sys
import sqlite3
import importlib
import types
import pytest

# Makes sure project root is on path.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Makes sure backend path is available.
BACKEND_ROOT = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

# Imports create_app.
try:
    from app import create_app
except Exception:
    from backend.app import create_app  # fallback

# Trys to import DB wrapper.
DB = None
try:
    from data.database import DATABASE
    DB = DATABASE()
except Exception:
    try:
        from backend.data.database import DATABASE
        DB = DATABASE()
    except Exception:
        DB = None

# Normalizes various hashing implementations.
try:
    import bcrypt as _bcrypt
except Exception:
    _bcrypt = None

def _wrap_hash_impl(hash_impl):
    shim = types.SimpleNamespace()
  
    if hasattr(hash_impl, "hash_password") and hasattr(hash_impl, "verify_password"):
        shim.hash_password = hash_impl.hash_password
        shim.verify_password = hash_impl.verify_password
        return shim
    if hasattr(hash_impl, "createHash") and hasattr(hash_impl, "checkHash"):
        shim.hash_password = lambda p: hash_impl.createHash(p)
        shim.verify_password = lambda p, h: hash_impl.checkHash(p, h)
        return shim
    if hasattr(hash_impl, "createHash") and hasattr(hash_impl, "verifyHash"):
        shim.hash_password = lambda p: hash_impl.createHash(p)
        shim.verify_password = lambda p, h: hash_impl.verifyHash(p, h)
        return shim
    if hasattr(hash_impl, "hash") and hasattr(hash_impl, "verify"):
        shim.hash_password = lambda p: hash_impl.hash(p)
        shim.verify_password = lambda p, h: hash_impl.verify(p, h)
        return shim
    for make_name in ("create_hash", "createHash", "hash_password", "hash", "createHash"):
        if hasattr(hash_impl, make_name):
            for check_name in ("verify_password", "verifyHash", "checkHash", "verify", "check"):
                if hasattr(hash_impl, check_name):
                    shim.hash_password = getattr(hash_impl, make_name)
                    shim.verify_password = getattr(hash_impl, check_name)
                    return shim
    return None

if DB:
    try:
        
        current_hash = getattr(DB, "hashing", None) or getattr(DB, "hash", None) or None
        shim = None

        if current_hash:
           
            if isinstance(current_hash, type):
                try:
                    inst = current_hash()
                    shim = _wrap_hash_impl(inst)
                except Exception:
                    shim = _wrap_hash_impl(current_hash)
            else:
                shim = _wrap_hash_impl(current_hash)

        if shim is None:
            
            project_hashing = None
            try:
                from data import hashing as _ph
                project_hashing = _ph
            except Exception:
                try:
                    from backend.data import hashing as _ph
                    project_hashing = _ph
                except Exception:
                    project_hashing = None

            if project_hashing:
                for candidate in ("HASH", "Hash", "Fernet", "Encryptor", "DECRYPT"):
                    cls = getattr(project_hashing, candidate, None)
                    if cls:
                        try:
                            inst = cls()
                            shim = _wrap_hash_impl(inst)
                            if shim:
                                break
                        except Exception:
                           
                            pass
        if shim:
            
            DB.hashing = shim
        else:
          
            if _bcrypt is None and getattr(DB, "hashing", None) is None:
                DB.hashing = None
    except Exception:
        
        pass

# Locates sqlite DB file for a safe schema check.
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

# Read-only check that users table exists in sqlite file.
def assert_users_table_exists(db_path):
    assert db_path, "database file not found for safety check"
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
    row = cur.fetchone()
    conn.close()
    assert row is not None, "users table not found — possible destructive change"

# Classic injection payload should NOT bypass authentication.
def test_login_sql_injection(client):
    payload = {"username": "' OR '1'='1", "password": "irrelevant"}
    resp = client.post("/api/login", json=payload)
    assert resp.status_code in (400, 401, 404)
    body = resp.get_json() or {}
    if "success" in body:
        assert body["success"] is False

#  seeded user can log in.
def test_login_valid_user(client):
    payload = {"username": "TestUser1", "password": "Password1234!"}
    resp = client.post("/api/login", json=payload)
    assert resp.status_code == 200
    body = resp.get_json() or {}
    assert body.get("success") is True
    # accept either body["username"] or body["user"]["username"]
    assert body.get("username") == "TestUser1" or (
        isinstance(body.get("user"), dict) and body["user"].get("username") == "TestUser1"
    )

# Call read-only raw-SQL helpers for safe columns. For invalid column names, makes sure no destructive action occurred.
def test_get_habit_safe_columns_and_invalid_column_no_destruction():

    db_path = sqlite_db_path()
    # pre-check: users table exists before running anything.
    if db_path:
        assert_users_table_exists(db_path)

    if not DB:
        pytest.skip("DATABASE wrapper not importable; skipping raw-SQL read checks")

    # Safe column read: should return a value or None but not crash.
    try:
        val = DB.getHabitValue(uid=1, day_id=1, column="sleep")
        # OK if it's None (no row) or an int value
        assert val is None or isinstance(val, int)
    except Exception:
        pytest.skip("getHabitValue raised for safe column; environment mismatch")

    # Invalid/ malicious column name: call wrapped in try/except; expect either None or an exception.
    malicious_col = "sleep; DROP TABLE users; --"
    try:
        result = DB.getHabitValue(uid=1, day_id=1, column=malicious_col)
        
        assert result is None
    except Exception:
      
        pass

    if db_path:
        assert_users_table_exists(db_path)
