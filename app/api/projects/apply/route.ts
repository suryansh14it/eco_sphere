import { NextResponse } from 'next/server';

// Placeholder endpoint. Project applications will be wired to the project
// management flow in a later phase.
export async function POST() {
  return NextResponse.json(
    { success: false, message: 'Project applications are not enabled yet.' },
    { status: 501 }
  );
}
