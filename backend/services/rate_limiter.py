import sqlite3
import os
from datetime import date
from fastapi import HTTPException
from pathlib import Path

# Database path in the backend directory
DB_PATH = Path(__file__).parent.parent / "usage_limits.db"

# Daily limit for AI requests per user
DAILY_AI_LIMIT = int(os.getenv("DAILY_AI_REQUESTS_PER_USER", 50))

def init_db():
    """Initialize the usage database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS daily_usage (
            uid TEXT,
            day TEXT,
            count INTEGER,
            PRIMARY KEY (uid, day)
        )
    """)
    conn.commit()
    conn.close()

# Initialize on module load
init_db()

def check_and_increment(uid: str) -> dict:
    """
    Check if user is within their daily AI limit and increments counter if they are.
    Uses SQLite for persistence across server restarts.
    """
    today = str(date.today())
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Get current usage
        cursor.execute("SELECT count FROM daily_usage WHERE uid = ? AND day = ?", (uid, today))
        row = cursor.fetchone()
        current_usage = row[0] if row else 0

        if current_usage >= DAILY_AI_LIMIT:
            conn.close()
            raise HTTPException(
                status_code=429,
                detail={
                    "message": f"You've used all {DAILY_AI_LIMIT} free AI requests for today. Come back tomorrow!",
                    "limit": DAILY_AI_LIMIT,
                    "used": current_usage,
                    "resets": "midnight (local server time)",
                }
            )

        # Increment and store
        new_usage = current_usage + 1
        cursor.execute("""
            INSERT INTO daily_usage (uid, day, count) 
            VALUES (?, ?, ?) 
            ON CONFLICT(uid, day) DO UPDATE SET count = excluded.count
        """, (uid, today, new_usage))
        
        conn.commit()
        return {
            "used": new_usage,
            "limit": DAILY_AI_LIMIT,
            "remaining": DAILY_AI_LIMIT - new_usage,
        }
    finally:
        conn.close()

def get_current_usage(uid: str) -> dict:
    """Returns current usage without incrementing."""
    today = str(date.today())
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT count FROM daily_usage WHERE uid = ? AND day = ?", (uid, today))
    row = cursor.fetchone()
    current_usage = row[0] if row else 0
    conn.close()
    
    return {
        "used": current_usage,
        "limit": DAILY_AI_LIMIT,
        "remaining": DAILY_AI_LIMIT - current_usage,
    }
