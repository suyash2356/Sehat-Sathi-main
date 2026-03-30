from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import pickle
from PIL import Image
import io

# Initialize app
app = Flask(__name__)
CORS(app)

# Get directory of this file for relative paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load model
model = load_model(os.path.join(BASE_DIR, "skin_model.h5"))

# Load class names
class_names_path = os.path.join(BASE_DIR, "class_names.pkl")
if os.path.exists(class_names_path):
    with open(class_names_path, "rb") as f:
        class_names = pickle.load(f)
else:
    # Fallback: default 5 classes
    class_names = ["Acne", "Benign_tumors", "Eczema", "Fungal infection", "Psoriasis"]

print(f"Loaded model with {len(class_names)} classes: {class_names}")


def preprocess_image(img_bytes):
    """Preprocess image for MobileNetV2 (224x224 RGB)"""
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0  # Normalize to [0, 1]
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files["image"]
        img_bytes = file.read()

        # Preprocess
        img_array = preprocess_image(img_bytes)

        # Predict
        predictions = model.predict(img_array)[0]
        top_idx = int(np.argmax(predictions))
        confidence = float(predictions[top_idx]) * 100

        disease = class_names[top_idx]

        return jsonify({
            "disease": disease,
            "confidence": round(confidence, 2)
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/")
def home():
    return "Skin Disease Detection API is running 🚀"


if __name__ == "__main__":
    app.run(debug=True, port=5001)
