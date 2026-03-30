from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

# Initialize app
app = Flask(__name__)
CORS(app)

# Get directory of this file for relative paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load model and encoder
model = pickle.load(open(os.path.join(BASE_DIR, "model.pkl"), "rb"))
le = pickle.load(open(os.path.join(BASE_DIR, "label_encoder.pkl"), "rb"))

# Get the exact feature columns from the trained model
columns = list(model.feature_names_in_)
print(f"Model loaded with {len(columns)} features")


# Function: Top 3 prediction
def predict_top3(input_dict):
    
    # Build binary feature array in correct column order (no pandas needed)
    input_array = np.array([[input_dict.get(col, 0) for col in columns]])
    
    probs = model.predict_proba(input_array)[0]
    
    top3_idx = np.argsort(probs)[-3:][::-1]
    
    diseases = le.inverse_transform(top3_idx)
    probabilities = probs[top3_idx]
    
    results = []
    for d, p in zip(diseases, probabilities):
        results.append({
            "disease": d,
            "probability": round(float(p)*100, 2)
        })
    
    return results


# API endpoint
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json  # input from frontend
    
    # The frontend sends { "symptoms": ["itching", "cough", ...] }
    # Convert array of symptom names to binary dict
    symptom_list = data.get("symptoms", [])
    if isinstance(symptom_list, list):
        input_dict = {col: 1 if col in symptom_list else 0 for col in columns}
    else:
        # Fallback: if someone sends a dict directly
        input_dict = data
    
    results = predict_top3(input_dict)
    
    return jsonify({
        "top_disease": results[0]["disease"],
        "confidence": results[0]["probability"],
        "other_possible": results[1:],
        "message": "This is AI-based prediction. Please consult a doctor."
    })

@app.route("/")
def home():
    return "API is running successfully 🚀"


# Run server
if __name__ == "__main__":
    app.run(debug=True, port=5000)