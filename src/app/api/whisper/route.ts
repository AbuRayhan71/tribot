import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const whisperClient = new OpenAI({
  apiKey: process.env.AZURE_WHISPER_API_KEY,
  baseURL: `${process.env.AZURE_WHISPER_ENDPOINT}/openai/deployments/${process.env.AZURE_WHISPER_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': '2024-02-15-preview' },
  defaultHeaders: {
    'api-key': process.env.AZURE_WHISPER_API_KEY,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const transcription = await whisperClient.audio.transcriptions.create({
      file: audioFile,
      model: "", // Leave empty for Azure
    });

    return NextResponse.json({ transcription: transcription.text });
  } catch (error) {
    console.error('Azure Whisper Error:', error);
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
  }
}
