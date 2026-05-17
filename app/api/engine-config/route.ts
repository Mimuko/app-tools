import { NextResponse } from 'next/server';
import { loadEngineConfigFromDocs } from '@/lib/state-engine/csv-sources';

export async function GET() {
  try {
    const config = loadEngineConfigFromDocs();
    return NextResponse.json(config);
  } catch (e) {
    console.error('engine-config load error', e);
    return NextResponse.json(
      { error: 'Failed to load engine config' },
      { status: 500 }
    );
  }
}
