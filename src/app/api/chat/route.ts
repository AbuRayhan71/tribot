import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': '2024-02-15-preview' },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.AZURE_OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Azure OpenAI API key not configured' }, { status: 500 });
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
    console.error('Azure OpenAI Error:', error);
    return NextResponse.json({ 
      error: 'Failed to get AI response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
