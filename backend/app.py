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

if __name__ == '__main__':
    app.run(debug=True)