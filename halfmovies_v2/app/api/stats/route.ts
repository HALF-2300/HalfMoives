import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    uptime: process.uptime(),
    status: 'ok',
    phase: '1'
  });
}
