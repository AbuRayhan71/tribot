// app/api/chat/route.ts (or .js)
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
    // Better error checking
    if (!process.env.AZURE_OPENAI_API_KEY) {
      console.error('Azure OpenAI API key is missing');
      return NextResponse.json({ error: 'Azure OpenAI API key not configured' }, { status: 500 });
    }

    if (!process.env.AZURE_OPENAI_BASE_URL) {
      console.error('Azure OpenAI base URL is missing');
      return NextResponse.json({ error: 'Azure OpenAI base URL not configured' }, { status: 500 });
    }

    if (!process.env.AZURE_DEPLOYMENT_NAME) {
      console.error('Azure deployment name is missing');
      return NextResponse.json({ error: 'Azure deployment name not configured' }, { status: 500 });
    }

    const { message } = await request.json();

    console.log('Making request to Azure OpenAI...');

    const completion = await openai.chat.completions.create({
      model: "", // Leave empty for Azure deployments
      messages: [
        {
          role: "system",
          content: "You are Tribot, a helpful medical triage assistant developed at UNSW Sydney. Provide professional medical triage guidance while emphasizing that this is preliminary assessment only and users should seek professional medical care for serious concerns."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't process your request properly. Please try again.";

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Azure OpenAI API Error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json({ 
      error: 'Failed to get AI response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
