import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

let _client: OpenAI | null = null;
function getClient() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const baseURL = process.env.AZURE_OPENAI_BASE_URL;
  const deployment = process.env.AZURE_DEPLOYMENT_NAME;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

  if (!apiKey || !baseURL || !deployment || !apiVersion) {
    throw new Error("Missing AZURE_* env vars");
  }

  if (!_client) {
    _client = new OpenAI({
      apiKey,
      baseURL: `${baseURL}/openai/deployments/${deployment}`,
      defaultQuery: { "api-version": apiVersion },
      defaultHeaders: { "api-key": apiKey },
    });
  }
  return _client;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const message = body?.message;
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Invalid request: message is required" }, { status: 400 });
    }

    const openai = getClient();

    const completion = await openai.chat.completions.create({
      model: process.env.AZURE_DEPLOYMENT_NAME!, // ✅ use deployment name
      messages: [
        { role: "system", content: "You are Tribot, a helpful medical triage assistant." },
        { role: "user", content: message },
      ],
      max_tokens: 150,
    });

    const response =
      completion.choices[0]?.message?.content ?? "Sorry, I couldn't understand that.";

    return NextResponse.json({ response });
  } catch (err) {
    console.error("Azure OpenAI API Error:", err);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
