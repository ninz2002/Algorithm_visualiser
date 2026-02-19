from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def get_db():
    return sqlite3.connect("database/algorithms.db")

@app.route("/api/algorithms/<key>", methods=["GET"])
def get_algorithm(key):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
SELECT
    key,
    name,
    short_description,
    time_complexity,
    best_case,
    average_case,
    worst_case,
    space_complexity,
    difficulty,
    category
FROM algorithms
WHERE key = ?
""", (key,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Algorithm not found"}), 404

    return jsonify({
        "name": row[0],
        "short_description": row[1],
        "definition": row[2],
        "time_complexity": row[3],
        "space_complexity": row[4],
        "pseudocode": row[5],
        "difficulty": row[6],
        "category": row[7]
    })

#linear search algorithm with step-by-step tracing
@app.route("/linear-search", methods=["POST"])
def linear_search():
    body = request.json

    if not body or "array" not in body or "target" not in body:
        return jsonify({"error": "Invalid input"}), 400

    arr = body["array"]
    target = body["target"]

    steps = []
    step_no = 1

    # Step 1: start
    steps.append({
        "step": step_no,
        "line": 1,
        "action": "start",
        "variables": {},
        "data": arr,
        "message": "Starting Linear Search"
    })
    step_no += 1

    # Loop execution
    for i in range(len(arr)):
        # Step: compare
        steps.append({
            "step": step_no,
            "line": 3,
            "action": "compare",
            "variables": {"i": i},
            "data": arr,
            "message": f"Comparing element at index {i} with target"
        })
        step_no += 1

        if arr[i] == target:
            # Step: found
            steps.append({
                "step": step_no,
                "line": 4,
                "action": "found",
                "variables": {"i": i},
                "data": arr,
                "message": f"Target found at index {i}"
            })
            return jsonify({"steps": steps})

    # Step: not found
    steps.append({
        "step": step_no,
        "line": 5,
        "action": "not_found",
        "variables": {},
        "data": arr,
        "message": "Target not found in the array"
    })

    return jsonify({"steps": steps})


@app.route('/bubble-sort', methods=['POST'])
def bubble_sort():
    data = request.json
    arr = data['array']

    steps = []
    step = 0
    n = len(arr)

    # Start step
    steps.append({
        "step": step,
        "line": 1,
        "action": "start",
        "variables": {},
        "data": {
            "array": arr.copy()
        },
        "message": "Starting Bubble Sort"
    })

    for i in range(n):
        for j in range(0, n - i - 1):
            step += 1
            steps.append({
                "step": step,
                "line": 3,
                "action": "compare",
                "variables": {
                    "i": i,
                    "j": j
                },
                "data": {
                    "array": arr.copy()
                },
                "message": f"Comparing index {j} and {j + 1}"
            })

            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                step += 1
                steps.append({
                    "step": step,
                    "line": 4,
                    "action": "swap",
                    "variables": {
                        "i": i,
                        "j": j
                    },
                    "data": {
                        "array": arr.copy()
                    },
                    "message": f"Swapped index {j} and {j + 1}"
                })

    # Final step
    step += 1
    steps.append({
        "step": step,
        "line": 6,
        "action": "sorted",
        "variables": {},
        "data": {
            "array": arr.copy()
        },
        "message": "Array is fully sorted"
    })

    return jsonify({"steps": steps})


@app.route('/n-queens', methods=['POST'])
def n_queens():
    body = request.json

    if not body or "n" not in body:
        return jsonify({"error": "Invalid input"}), 400

    n = body["n"]

    board = [-1] * n
    steps = []
    step_no = 1

    def snapshot():
        return {
            "board": board.copy()
        }

    def add_step(line, action, message, variables=None):
        nonlocal step_no
        steps.append({
            "step": step_no,
            "line": line,
            "action": action,
            "variables": variables or {},
            "data": snapshot(),
            "message": message
        })
        step_no += 1

    def is_safe(row, col):
        for r in range(row):
            add_step(
                line=4,
                action="check",
                message=f"Checking conflict with queen at row {r}",
                variables={"row": row, "col": col, "check_row": r}
            )

            if board[r] == col or abs(board[r] - col) == abs(r - row):
                return False
        return True

    def backtrack(row):
        if row == n:
            add_step(
                line=1,
                action="success",
                message="All queens placed successfully"
            )
            return True

        for col in range(n):
            add_step(
                line=2,
                action="try",
                message=f"Trying to place queen at row {row}, col {col}",
                variables={"row": row, "col": col}
            )

            if is_safe(row, col):
                board[row] = col
                add_step(
                    line=5,
                    action="place",
                    message=f"Placed queen at row {row}, col {col}",
                    variables={"row": row, "col": col}
                )

                if backtrack(row + 1):
                    return True

                board[row] = -1
                add_step(
                    line=6,
                    action="remove",
                    message=f"Backtracking from row {row}, col {col}",
                    variables={"row": row, "col": col}
                )

        return False

    add_step(
        line=1,
        action="start",
        message=f"Starting N-Queens for N = {n}"
    )

    solved = backtrack(0)

    return jsonify({
        "steps": steps,
        "solutionFound": solved
    })



if __name__ == '__main__':
    app.run(debug=True)