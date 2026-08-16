import { NextRequest, NextResponse } from "next/server";

// Make sure Ollama is running locally: `ollama serve`
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

export const runtime = "nodejs"; // Important for streaming
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = "llama3", stream = true } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Forward to Ollama
    const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream,
      }),
    });

    if (!ollamaRes.ok) {
      const errorText = await ollamaRes.text();
      return NextResponse.json(
        { error: `Ollama error: ${errorText}` },
        { status: ollamaRes.status }
      );
    }

    // Stream response back to client
    if (stream) {
      return new NextResponse(ollamaRes.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await ollamaRes.json();
    return NextResponse.json(data);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
