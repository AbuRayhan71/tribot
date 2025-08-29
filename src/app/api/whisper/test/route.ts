import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test if environment variables are loaded
    const whisperKey = process.env.AZURE_WHISPER_API_KEY;
    const whisperEndpoint = process.env.AZURE_WHISPER_API_ENDPOINT;

    if (!whisperKey || !whisperEndpoint) {
      return NextResponse.json({
        error: 'Missing environment variables',
        hasWhisperKey: !!whisperKey,
        hasWhisperEndpoint: !!whisperEndpoint
      }, { status: 500 });
    }

    // Test basic connectivity to Azure Whisper endpoint
    const testResponse = await fetch(whisperEndpoint, {
      method: 'GET',
      headers: {
        'api-key': whisperKey,
      },
    });

    return NextResponse.json({
      status: 'Whisper API configuration looks good!',
      endpoint: whisperEndpoint.replace(/api-key=[^&]*/, 'api-key=***'),
      connectivityTest: testResponse.status === 200 ? 'OK' : `Status: ${testResponse.status}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Whisper test error:', error);
    return NextResponse.json({
      error: 'Whisper API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
