import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "algorithms.db")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS algorithms (
    key TEXT PRIMARY KEY,
    name TEXT,
    short_description TEXT,
    time_complexity TEXT,
    best_case TEXT,
    average_case TEXT,
    worst_case TEXT,
    space_complexity TEXT,
    difficulty TEXT,
    category TEXT,
    is_active INTEGER
)
""")

conn.commit()
conn.close()

