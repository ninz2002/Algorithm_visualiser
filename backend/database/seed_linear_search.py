import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "algorithms.db")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("""
INSERT OR IGNORE INTO algorithms (
    key,
    name,
    short_description,
    time_complexity,
    best_case,
    average_case,
    worst_case,
    space_complexity,
    difficulty,
    category,
    is_active
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (
    "linear-search",
    "Linear Search",
    "Linear Search checks each element in a list, one by one, from start to finish. It's like reading a book page by page until you find the word you're looking for.",
    "O(n)",
    "O(1)",
    "O(n)",
    "O(n)",
    "O(1)",
    "Beginner",
    "Searching",
    1
))

cursor.execute("""
INSERT OR IGNORE INTO algorithms (
    key,
    name,
    short_description,
    time_complexity,
    best_case,
    average_case,
    worst_case,
    space_complexity,
    difficulty,
    category,
    is_active
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (
    "bubble-sort",
    "Bubble Sort",
    "Bubble Sort works by repeatedly stepping through the list, comparing adjacent elements and swapping them if they are in the wrong order. Larger elements slowly move to the end of the list.",
    "O(n²)",
    "O(n)",
    "O(n²)",
    "O(n²)",
    "O(1)",
    "Beginner",
    "Sorting",
    1
))

cursor.execute("""
INSERT OR IGNORE INTO algorithms (
    key,
    name,
    short_description,
    time_complexity,
    best_case,
    average_case,
    worst_case,
    space_complexity,
    difficulty,
    category,
    is_active
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (
    "n-queens",
    "N Queens",
    "The N Queens problem involves placing N queens on an N x N chessboard such that no two queens attack each other.",
    "O(n!)",
    "O(n)",
    "O(n!)",
    "O(n!)",
    "O(n)",
    "Intermediate",
    "Backtracking",
    1
))

conn.commit()
conn.close()

print("Linear Search data inserted.")
