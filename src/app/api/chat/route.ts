import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_BASE_URL}/openai/deployments/${process.env.AZURE_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.AZURE_OPENAI_API_KEY) {
      console.error('Azure OpenAI API key is not set');
      return NextResponse.json({ error: 'Azure OpenAI API key is not configured' }, { status: 500 });
    }

    const { message } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "", // Leave empty for Azure deployments
      messages: [
        {
          role: "system",
          content: "You are Tribot, a helpful medical triage assistant."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 150,
    });

    const response = completion.choices[0]?.message?.content || "Sorry, I couldn't understand that.";

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Azure OpenAI API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to get AI response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
