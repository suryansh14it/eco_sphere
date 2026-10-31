import { NextResponse } from 'next/server';

// Placeholder endpoint. Educational PDFs are served from static assets for now.
export async function GET() {
  return NextResponse.json({ success: true, pdfs: [] });
}
