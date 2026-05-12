import { NextResponse } from 'next/server';
import { parseAndSelectDestinations } from '@/lib/claude-trips';

export async function POST(request: Request) {
  const { query } = await request.json() as { query: string };
  if (!query?.trim()) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }
  const { request: tripRequest, selections } = await parseAndSelectDestinations(query);
  return NextResponse.json({ request: tripRequest, selections });
}
