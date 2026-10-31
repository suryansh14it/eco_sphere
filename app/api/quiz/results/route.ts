import { NextResponse } from 'next/server';

// Placeholder endpoint. Quiz results are currently handled by /api/quiz/evaluate.
export async function GET() {
  return NextResponse.json({ success: true, results: [] });
}
