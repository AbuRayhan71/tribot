import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert File to FormData for Azure API
    const azureFormData = new FormData();
    azureFormData.append('file', audioFile);

    const response = await fetch(process.env.AZURE_WHISPER_API_ENDPOINT!, {
      method: 'POST',
      headers: {
        'api-key': process.env.AZURE_WHISPER_API_KEY!,
      },
      body: azureFormData,
    });

    if (!response.ok) {
      throw new Error(`Azure Whisper API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      transcription: data.text || data.translation || 'No transcription available'
    });

  } catch (error) {
    console.error('Azure Whisper API error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
