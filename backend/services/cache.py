import sqlite3
import json
import time
import os
import threading
from pathlib import Path
from typing import Any, Optional, Dict
import structlog

logger = structlog.get_logger()

# ─────────────────────────────────────────────────────────────────────────────
# DEPLOYMENT NOTE: 
# Render.com has an ephemeral filesystem. This SQLite DB will be lost on every 
# deployment. For true production persistence, replace this CacheService with:
# 1. A Persistent Volume (Disk) mounted at a specific path.
# 2. A managed Redis instance.
# 3. A table in your primary production database (PostgreSQL).
# ─────────────────────────────────────────────────────────────────────────────

# Use /tmp for slightly better compatibility with read-only filesystems
# fallback to current directory if /tmp is not available (e.g. Windows dev)
DEFAULT_CACHE_DIR = "/tmp" if os.path.exists("/tmp") else str(Path(__file__).parent.parent)
CACHE_DB_PATH = os.environ.get("CACHE_DB_PATH", os.path.join(DEFAULT_CACHE_DIR, "nyaya_cache.db"))

class CacheService:
    def __init__(self):
        self.enabled = True
        try:
            self._init_db()
            # Run cleanup in a background thread to avoid slowing down startup
            threading.Thread(target=self.cleanup_if_needed, daemon=True).start()
        except Exception as e:
            logger.error("cache_init_failed", error=str(e))
            self.enabled = False

    def _init_db(self):
        """Initialize the SQLite cache database."""
        conn = sqlite3.connect(CACHE_DB_PATH)
        cursor = conn.cursor()
        
        # Table for AI responses
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ai_cache (
                cache_key TEXT PRIMARY KEY,
                cache_value TEXT,
                expires_at REAL
            )
        ''')
        
        # Table for Indian Kanoon responses
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS kanoon_cache (
                cache_key TEXT PRIMARY KEY,
                cache_value TEXT,
                expires_at REAL
            )
        ''')
        
        conn.commit()
        conn.close()

    def get_cache_size_mb(self) -> float:
        """Return the size of the cache database in MB."""
        try:
            if os.path.exists(CACHE_DB_PATH):
                return os.path.getsize(CACHE_DB_PATH) / (1024 * 1024)
            return 0.0
        except Exception:
            return 0.0

    def cleanup_if_needed(self, max_size_mb: int = 500):
        """
        Delete expired entries and ensure total size is under max_size_mb.
        """
        if not self.enabled:
            return

        try:
            conn = sqlite3.connect(CACHE_DB_PATH)
            cursor = conn.cursor()
            
            # 1. Delete expired entries
            now = time.time()
            cursor.execute("DELETE FROM ai_cache WHERE expires_at < ?", (now,))
            cursor.execute("DELETE FROM kanoon_cache WHERE expires_at < ?", (now,))
            
            # 2. If size is still too large, delete oldest 25% entries
            if self.get_cache_size_mb() > max_size_mb:
                logger.warning("cache_limit_exceeded", size=f"{self.get_cache_size_mb():.2f}MB", limit=max_size_mb)
                for table in ["ai_cache", "kanoon_cache"]:
                    cursor.execute(f'''
                        DELETE FROM {table} 
                        WHERE cache_key IN (
                            SELECT cache_key FROM {table} 
                            ORDER BY expires_at ASC 
                            LIMIT (SELECT COUNT(*) FROM {table}) / 4
                        )
                    ''')
            
            conn.commit()
            # 3. VACUUM to reclaim space
            cursor.execute("VACUUM")
            conn.close()
            
            logger.info("cache_cleanup_complete", new_size_mb=f"{self.get_cache_size_mb():.2f}")
        except Exception as e:
            logger.error("cache_cleanup_failed", error=str(e))

    def get(self, table: str, key: str) -> Optional[Any]:
        """Retrieve a value from the cache with graceful fallback."""
        if not self.enabled:
            return None
            
        try:
            conn = sqlite3.connect(CACHE_DB_PATH)
            cursor = conn.cursor()
            
            if table not in ["ai_cache", "kanoon_cache"]:
                return None
                
            cursor.execute(f"SELECT cache_value, expires_at FROM {table} WHERE cache_key = ?", (key,))
            row = cursor.fetchone()
            conn.close()
            
            if row:
                value_json, expires_at = row
                if expires_at > time.time():
                    return json.loads(value_json)
                else:
                    self.delete(table, key)
            
            return None
        except Exception as e:
            logger.error("cache_get_failed", error=str(e), table=table, key=key)
            return None

    def set(self, table: str, key: str, value: Any, ttl_days: int = 30):
        """Store a value in the cache with graceful fallback."""
        if not self.enabled:
            return
            
        try:
            conn = sqlite3.connect(CACHE_DB_PATH)
            cursor = conn.cursor()
            
            if table not in ["ai_cache", "kanoon_cache"]:
                return
                
            value_json = json.dumps(value)
            expires_at = time.time() + (ttl_days * 24 * 60 * 60)
            
            cursor.execute(f'''
                INSERT OR REPLACE INTO {table} (cache_key, cache_value, expires_at)
                VALUES (?, ?, ?)
            ''', (key, value_json, expires_at))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error("cache_set_failed", error=str(e), table=table, key=key)

    def delete(self, table: str, key: str):
        """Remove a key from cache."""
        if not self.enabled:
            return
            
        try:
            conn = sqlite3.connect(CACHE_DB_PATH)
            cursor = conn.cursor()
            cursor.execute(f"DELETE FROM {table} WHERE cache_key = ?", (key,))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error("cache_delete_failed", error=str(e), table=table, key=key)

    def get_stats(self) -> Dict[str, Any]:
        """Return cache health metrics."""
        stats = {
            "size_mb": round(self.get_cache_size_mb(), 2),
            "total_entries": 0,
            "oldest_entry": "N/A",
            "enabled": self.enabled
        }
        
        if not self.enabled:
            return stats
            
        try:
            conn = sqlite3.connect(CACHE_DB_PATH)
            cursor = conn.cursor()
            
            # Count total entries
            cursor.execute("SELECT (SELECT COUNT(*) FROM ai_cache) + (SELECT COUNT(*) FROM kanoon_cache)")
            stats["total_entries"] = cursor.fetchone()[0]
            
            # Find oldest entry timestamp
            cursor.execute("SELECT MIN(expires_at) FROM (SELECT expires_at FROM ai_cache UNION ALL SELECT expires_at FROM kanoon_cache)")
            min_expires = cursor.fetchone()[0]
            
            if min_expires:
                # Calculate created_at roughly (assuming 30 day default)
                oldest_ts = min_expires - (30 * 24 * 60 * 60)
                stats["oldest_entry"] = time.strftime('%Y-%m-%d', time.gmtime(oldest_ts))
                
            conn.close()
        except Exception as e:
            logger.error("cache_stats_failed", error=str(e))
            
        return stats

# Global instance
cache_service = CacheService()
