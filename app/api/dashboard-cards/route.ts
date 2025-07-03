import { fetchCardData } from '@/app/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await fetchCardData();
  return NextResponse.json(data);
}
