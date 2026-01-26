from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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

    # Step: not found - FIXED LINE NUMBER
    steps.append({
        "step": step_no,
        "line": 5,  # ✅ CHANGED FROM 6 TO 5
        "action": "not_found",
        "variables": {},
        "data": arr,
        "message": "Target not found in the array"
    })

    return jsonify({"steps": steps})

if __name__ == "__main__":
    app.run(debug=True)