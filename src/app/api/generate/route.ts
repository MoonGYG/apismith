import { NextRequest, NextResponse } from "next/server";

const MIMO_API_URL = process.env.MIMO_API_URL || "http://localhost:19911/v1/chat/completions";
const MIMO_API_KEY = process.env.MIMO_API_KEY || "";

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

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (MIMO_API_KEY) {
      headers["Authorization"] = `Bearer ${MIMO_API_KEY}`;
    }

    const response = await fetch(MIMO_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "mimo-v2.5-pro",
        messages: [systemMessage, { role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
        stream: false,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ content: buildFallbackDocs(prompt), source: "fallback" });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({
      content: content || buildFallbackDocs(prompt),
      source: content ? "mimo" : "fallback",
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { content: "Error: Failed to generate documentation. Please check the AI service connection." },
      { status: 500 }
    );
  }
}

function buildFallbackDocs(prompt: string) {
  const projectMatch = prompt.match(/Project:\s*(.+)/i);
  const descMatch = prompt.match(/Description:\s*(.+)/i);
  const project = projectMatch?.[1]?.trim() || "API Service";
  const description = descMatch?.[1]?.trim() || "RESTful API documentation";

  const endpointBlocks = prompt
    .split("---")
    .map((block) => {
      const method = block.match(/Method:\s*(.+)/i)?.[1]?.trim() || "GET";
      const path = block.match(/Path:\s*(.+)/i)?.[1]?.trim() || "/api/resource";
      const endpointDescription = block.match(/Description:\s*(.+)/i)?.[1]?.trim() || "Endpoint operation";
      const headers = block.match(/Headers:\s*(.+)/i)?.[1]?.trim() || "Authorization: Bearer <token>";
      const body = block.match(/Request Body:\s*([\s\S]*?)\nResponse Example:/i)?.[1]?.trim() || "None";
      const response = block.match(/Response Example:\s*([\s\S]*)/i)?.[1]?.trim() || '{ "status": "ok" }';
      return { method, path, endpointDescription, headers, body, response };
    })
    .filter((ep) => ep.path.startsWith("/"));

  const endpoints = endpointBlocks.length ? endpointBlocks : [{
    method: "GET",
    path: "/api/users",
    endpointDescription: "Retrieve user records",
    headers: "Authorization: Bearer <token>",
    body: "None",
    response: '{ "users": [] }',
  }];

  const endpointDocs = endpoints.map((ep) => `## ${ep.method} ${ep.path}\n\n${ep.endpointDescription}\n\n### Headers\n\n| Header | Value | Required |\n| --- | --- | --- |\n${ep.headers.split(",").map((h) => {
    const [key, ...rest] = h.split(":");
    return `| ${key?.trim() || "Authorization"} | ${rest.join(":").trim() || "Bearer <token>"} | Yes |`;
  }).join("\n")}\n\n### Request Body\n\n\`\`\`json\n${ep.body === "None" ? "{}" : ep.body}\n\`\`\`\n\n### Response\n\n\`\`\`json\n${ep.response}\n\`\`\`\n\n### Example Request\n\n\`\`\`bash\ncurl -X ${ep.method} \"https://api.example.com${ep.path}\" \\\n  -H \"Authorization: Bearer <token>\" \\\n  -H \"Content-Type: application/json\"\n\`\`\`\n`).join("\n");

  return `# ${project} API Documentation\n\n${description}\n\n## Overview\n\nBase URL: \`https://api.example.com\`\n\nAll requests use JSON and require bearer token authentication unless specified otherwise.\n\n## Authentication\n\n\`\`\`http\nAuthorization: Bearer <token>\n\`\`\`\n\n${endpointDocs}\n## Common Error Responses\n\n| Status | Meaning |\n| --- | --- |\n| 400 | Invalid request payload |\n| 401 | Missing or invalid authentication token |\n| 404 | Resource not found |\n| 429 | Rate limit exceeded |\n| 500 | Internal server error |\n\n## Rate Limiting\n\nDefault limit: 100 requests per minute per API key. Include retry handling for HTTP 429 responses.\n`;
}
