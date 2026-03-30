import { NextRequest, NextResponse } from 'next/server';

// Stub disease descriptions for development mode
const STUB_DISEASES: Record<string, { confidence: number; description: string; other_possible: { disease: string; probability: number }[] }> = {
  'Fungal infection': {
    confidence: 87.3,
    description: 'A skin infection caused by fungi, leading to itching, redness, and rashes.',
    other_possible: [
      { disease: 'Allergy', probability: 7.1 },
      { disease: 'Drug Reaction', probability: 5.6 },
    ],
  },
  'Common Cold': {
    confidence: 91.2,
    description: 'A mild viral infection of the nose and throat causing sneezing, runny nose, and sore throat.',
    other_possible: [
      { disease: 'Pneumonia', probability: 5.4 },
      { disease: 'Bronchial Asthma', probability: 3.4 },
    ],
  },
  'Diabetes': {
    confidence: 85.6,
    description: 'A metabolic disease causing high blood sugar levels due to insufficient insulin production or response.',
    other_possible: [
      { disease: 'Hypoglycemia', probability: 8.2 },
      { disease: 'Hypothyroidism', probability: 6.2 },
    ],
  },
};

// Deterministic stub: pick disease based on symptom count
function getStubPrediction(symptoms: string[]) {
  const keys = Object.keys(STUB_DISEASES);
  const index = symptoms.length % keys.length;
  const disease = keys[index];
  const data = STUB_DISEASES[disease];
  return {
    top_disease: disease,
    confidence: data.confidence,
    description: data.description,
    other_possible: data.other_possible,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms } = body;

    // Validate input
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Please provide a non-empty array of symptoms.' },
        { status: 400 }
      );
    }

    // Check if ML model server URL is configured
    const mlUrl = process.env.ML_PREDICT_DISEASE_URL;

    if (mlUrl) {
      // ─── PRODUCTION: Forward to ML server ─────────────────
      try {
        const mlResponse = await fetch(mlUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symptoms }),
        });

        if (!mlResponse.ok) {
          const errorText = await mlResponse.text();
          console.error('ML server error:', errorText);
          return NextResponse.json(
            { error: 'ML model server returned an error. Please try again later.' },
            { status: 502 }
          );
        }

        const mlData = await mlResponse.json();
        return NextResponse.json(mlData);
      } catch (fetchError) {
        console.error('Failed to connect to ML server:', fetchError);
        return NextResponse.json(
          { error: 'Could not connect to the prediction server. Please try again later.' },
          { status: 503 }
        );
      }
    } else {
      // ─── DEVELOPMENT: Return stub prediction ──────────────
      console.log('[DEV] predict-disease stub response for symptoms:', symptoms);
      const stub = getStubPrediction(symptoms);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      return NextResponse.json(stub);
    }
  } catch (error) {
    console.error('predict-disease route error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
