// app/api/chat/route.ts (or .js)
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // avoid Edge inlining envs at build

let _client: OpenAI | null = null;
function getClient() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const baseURL = process.env.AZURE_OPENAI_BASE_URL;
  const deployment = process.env.AZURE_DEPLOYMENT_NAME;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

  if (!apiKey || !baseURL || !deployment || !apiVersion) {
    throw new Error("Missing one of AZURE_* env vars");
  }

  // Create only when first used (at runtime)
  if (!_client) {
    _client = new OpenAI({
      apiKey, // still required by the SDK, but header below is used by Azure
      baseURL: `${baseURL}/openai/deployments/${deployment}`,
      defaultQuery: { "api-version": apiVersion },
      defaultHeaders: { "api-key": apiKey },
    });
  }
  return _client;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    const openai = getClient();

    const completion = await openai.chat.completions.create({
      // With Azure + baseURL pointing to the deployment, model can be your deployment name:
      model: process.env.AZURE_DEPLOYMENT_NAME || "",
      messages: [
        { role: "system", content: "You are Tribot, a helpful medical triage assistant." },
        { role: "user", content: message },
      ],
      max_tokens: 150,
    });

    const response =
      completion.choices[0]?.message?.content ?? "Sorry, I couldn't understand that.";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Azure OpenAI API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to get AI response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
