# Skin Disease Detection Model (MobileNetV2)

Place your ML model files here:

## Required Files

1. **model.h5** (or model.pt) — Your trained MobileNetV2 model
2. **app.py** — Flask/FastAPI server that serves the model
3. **requirements.txt** — Python dependencies

## Expected API Contract

Your `app.py` server should expose a POST endpoint that:

### Request
```
POST /predict
Content-Type: multipart/form-data

image: <uploaded image file>
```

### Response
```json
{
  "disease": "Acne",
  "confidence": 74.8
}
```

## Disease Classes (5 fixed labels)

Your model should predict one of these exact names:
1. `Acne`
2. `Fungal infection`
3. `Eczema`
4. `Psoriasis`
5. `Benign_tumors`

## How to Connect

1. Start your Flask/FastAPI server (e.g., `python app.py` on port 5001)
2. Add this to `.env.local` in the project root:
   ```
   ML_SKIN_DISEASE_URL=http://localhost:5001/predict
   ```
3. The Next.js API route at `/api/skin-disease` will automatically proxy requests to your server.
