# run.py
from app import create_app
from log.log import logger

app = create_app()

if __name__ == "__main__":
    try:
        # IMPORTANT for packaged/Electron use:
        # - use_reloader=False: avoid spawning a child process that confuses Electron
        # - host=127.0.0.1: bind to loopback only
        # - port=5000: match what your frontend expects
        # - debug=False: stable behavior in production
        # - threaded=False: simpler lifecycle (set True only if you need it)
        logger.logDatabaseChange("Starting Flask server (packaged mode)...")
        app.run(
            host="127.0.0.1",
            port=5000,
            debug=False,
            use_reloader=False,
            threaded=False
        )
        logger.logDatabaseChange("Flask server started successfully")
    except Exception as e:
        logger.logFlaskError(f"Flask server failed to start: {e}")