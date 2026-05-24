import { NextRequest, NextResponse } from "next/server";

const MIMO_API_URL = "http://localhost:19911/v1/chat/completions";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    const systemMessage = {
      role: "system",
      content: `You are an expert technical writer specializing in API documentation. You generate clear, comprehensive, well-structured API documentation in Markdown format. Always include:
- Authentication details
- Request/response schemas with types
- Example curl commands
- Error codes and descriptions
- Rate limiting information when relevant
Format everything in clean Markdown with proper headers, tables, and code blocks.`,
    };

    const response = await fetch(MIMO_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mimo-v2.5-pro",
        messages: [systemMessage, { role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No content generated.";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { content: "Error: Failed to generate documentation. Please check the AI service connection." },
      { status: 500 }
    );
  }
}
