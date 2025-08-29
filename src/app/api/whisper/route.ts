import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎤 Whisper API called');

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      console.log('❌ No audio file provided');
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    console.log('📁 Audio file received:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type
    });

    // Check environment variables
    const whisperEndpoint = process.env.AZURE_WHISPER_API_ENDPOINT;
    const whisperKey = process.env.AZURE_WHISPER_API_KEY;

    if (!whisperEndpoint || !whisperKey) {
      console.log('❌ Missing environment variables');
      return NextResponse.json({
        error: 'Whisper API not configured',
        hasEndpoint: !!whisperEndpoint,
        hasKey: !!whisperKey
      }, { status: 500 });
    }

    console.log('🔗 Calling Azure Whisper API:', whisperEndpoint);

    // Create form data for Azure OpenAI Whisper API
    const azureFormData = new FormData();
    azureFormData.append('file', audioFile);
    azureFormData.append('model', 'whisper-1'); // Use the whisper model
    azureFormData.append('response_format', 'json');

    const response = await fetch(process.env.AZURE_WHISPER_API_ENDPOINT!, {
      method: 'POST',
      headers: {
        'api-key': process.env.AZURE_WHISPER_API_KEY!,
      },
      body: azureFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure Whisper API error:', response.status, errorText);
      throw new Error(`Azure Whisper API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      transcription: data.text || 'No transcription available'
    });

  } catch (error) {
    console.error('Whisper API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to transcribe audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
