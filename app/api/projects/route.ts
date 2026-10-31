import { NextResponse } from 'next/server';

// Placeholder endpoint. Public projects will be exposed here in a later phase.
export async function GET() {
  return NextResponse.json({ success: true, projects: [] });
}
