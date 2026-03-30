# Symptom-Based Disease Prediction Model

Place your ML model files here:

## Required Files

1. **model.pkl** (or model.h5) — Your trained Logistic Regression model
2. **app.py** — Flask/FastAPI server that serves the model
3. **requirements.txt** — Python dependencies

## Expected API Contract

Your `app.py` server should expose a POST endpoint that:

### Request
```json
POST /predict
Content-Type: application/json

{
  "symptoms": ["itching", "skin_rash", "fatigue", "high_fever"]
}
```

### Response
```json
{
  "top_disease": "Fungal infection",
  "confidence": 92.5,
  "description": "A skin infection caused by fungi...",
  "other_possible": [
    { "disease": "Allergy", "probability": 5.2 },
    { "disease": "Drug Reaction", "probability": 2.3 }
  ]
}
```

## Symptom IDs (use these exact names)

The symptom IDs sent from the frontend match the `id` field in `src/data/symptoms.json`.
Examples: `itching`, `skin_rash`, `nodal_skin_eruptions`, `continuous_sneezing`, `shivering`, `chills`, `joint_pain`, `stomach_pain`, `acidity`, `vomiting`, `fatigue`, `cough`, `high_fever`, `headache`, etc.

## How to Connect

1. Start your Flask/FastAPI server (e.g., `python app.py` on port 5000)
2. Add this to `.env.local` in the project root:
   ```
   ML_PREDICT_DISEASE_URL=http://localhost:5000/predict
   ```
3. The Next.js API route at `/api/predict-disease` will automatically proxy requests to your server.
