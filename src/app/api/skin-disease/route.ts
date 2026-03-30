import { NextRequest, NextResponse } from 'next/server';

// Stub responses for development
const STUB_SKIN_DISEASES = [
  { disease: 'Acne', confidence: 82.4 },
  { disease: 'Fungal infection', confidence: 76.1 },
  { disease: 'Eczema', confidence: 71.9 },
  { disease: 'Psoriasis', confidence: 68.5 },
  { disease: 'Benign_tumors', confidence: 64.2 },
];

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let imageData: FormData | Blob | null = null;

    if (contentType.includes('multipart/form-data')) {
      imageData = await req.formData();
      const file = imageData.get('image');
      if (!file) {
        return NextResponse.json(
          { error: 'No image file provided. Please upload an image.' },
          { status: 400 }
        );
      }
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      if (!body.image) {
        return NextResponse.json(
          { error: 'No image data provided. Please upload an image.' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid content type. Send multipart/form-data or JSON with base64 image.' },
        { status: 400 }
      );
    }

    // Check if ML model server URL is configured
    const mlUrl = process.env.ML_SKIN_DISEASE_URL;

    if (mlUrl) {
      // ─── PRODUCTION: Forward to ML server ─────────────────
      try {
        let mlResponse: Response;

        if (contentType.includes('multipart/form-data') && imageData instanceof FormData) {
          mlResponse = await fetch(mlUrl, {
            method: 'POST',
            body: imageData,
          });
        } else {
          const body = await req.clone().json();
          mlResponse = await fetch(mlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        }

        if (!mlResponse.ok) {
          const errorText = await mlResponse.text();
          console.error('ML skin server error:', errorText);
          return NextResponse.json(
            { error: 'ML model server returned an error. Please try again later.' },
            { status: 502 }
          );
        }

        const mlData = await mlResponse.json();
        return NextResponse.json(mlData);
      } catch (fetchError) {
        console.error('Failed to connect to ML skin server:', fetchError);
        return NextResponse.json(
          { error: 'Could not connect to the skin analysis server. Please try again later.' },
          { status: 503 }
        );
      }
    } else {
      // ─── DEVELOPMENT: Return stub response ────────────────
      console.log('[DEV] skin-disease stub response');

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Return a random-ish stub
      const stub = STUB_SKIN_DISEASES[Math.floor(Math.random() * STUB_SKIN_DISEASES.length)];
      return NextResponse.json(stub);
    }
  } catch (error) {
    console.error('skin-disease route error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
