"use client";

import { useRef, useState } from "react";

interface Header {
  key: string;
  value: string;
}

interface Endpoint {
  id: number;
  method: string;
  path: string;
  description: string;
  headers: Header[];
  body: string;
  response: string;
}

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const METHOD_COLORS: Record<string, string> = {
  GET: "method-get",
  POST: "method-post",
  PUT: "method-put",
  DELETE: "method-delete",
  PATCH: "method-patch",
};

const SAMPLE_ENDPOINTS: Endpoint[] = [
  {
    id: 1,
    method: "GET",
    path: "/api/users",
    description: "Retrieve all users with pagination support",
    headers: [{ key: "Authorization", value: "Bearer <token>" }],
    body: "",
    response: '{\n  "users": [\n    { "id": 1, "name": "Alice", "email": "alice@example.com" }\n  ],\n  "total": 100,\n  "page": 1\n}',
  },
  {
    id: 2,
    method: "POST",
    path: "/api/users",
    description: "Create a new user account",
    headers: [
      { key: "Authorization", value: "Bearer <token>" },
      { key: "Content-Type", value: "application/json" },
    ],
    body: '{\n  "name": "Bob",\n  "email": "bob@example.com",\n  "role": "admin"\n}',
    response: '{\n  "id": 2,\n  "name": "Bob",\n  "email": "bob@example.com",\n  "role": "admin",\n  "created_at": "2026-05-23T12:00:00Z"\n}',
  },
  {
    id: 3,
    method: "DELETE",
    path: "/api/users/:id",
    description: "Delete a user by ID",
    headers: [{ key: "Authorization", value: "Bearer <token>" }],
    body: "",
    response: '{\n  "message": "User deleted successfully",\n  "id": 2\n}',
  },
];

const SAMPLE_TASK_ENDPOINTS: Endpoint[] = [
  {
    id: 101,
    method: "GET",
    path: "/api/tasks",
    description: "Retrieve all tasks with optional filtering",
    headers: [{ key: "Authorization", value: "Bearer <token>" }],
    body: "",
    response: '{\n  "tasks": [\n    { "id": 1, "title": "Buy groceries", "completed": false, "created_at": "2026-05-26T10:00:00Z" },\n    { "id": 2, "title": "Write report", "completed": true, "created_at": "2026-05-25T08:30:00Z" }\n  ],\n  "total": 2\n}',
  },
  {
    id: 102,
    method: "POST",
    path: "/api/tasks",
    description: "Create a new task",
    headers: [
      { key: "Authorization", value: "Bearer <token>" },
      { key: "Content-Type", value: "application/json" },
    ],
    body: '{\n  "title": "Buy groceries",\n  "description": "Milk, eggs, bread",\n  "priority": "high"\n}',
    response: '{\n  "id": 3,\n  "title": "Buy groceries",\n  "description": "Milk, eggs, bread",\n  "priority": "high",\n  "completed": false,\n  "created_at": "2026-05-26T12:00:00Z"\n}',
  },
  {
    id: 103,
    method: "DELETE",
    path: "/api/tasks/:id",
    description: "Delete a task by ID",
    headers: [{ key: "Authorization", value: "Bearer <token>" }],
    body: "",
    response: '{\n  "message": "Task deleted successfully",\n  "id": 3\n}',
  },
];

const SAMPLE_TASK_DOCS = `# Task Manager API

RESTful API for managing tasks with CRUD operations.

**Base URL:** \`https://api.example.com\`

---

## Authentication

All endpoints require a Bearer token in the \`Authorization\` header.

\`\`\`
Authorization: Bearer <your-token>
\`\`\`

---

## Endpoints

### GET /api/tasks

Retrieve all tasks with optional filtering.

**Request**

\`\`\`bash
curl -X GET https://api.example.com/api/tasks \\
  -H "Authorization: Bearer <token>"
\`\`\`

**Response** \`200 OK\`

\`\`\`json
{
  "tasks": [
    { "id": 1, "title": "Buy groceries", "completed": false, "created_at": "2026-05-26T10:00:00Z" },
    { "id": 2, "title": "Write report", "completed": true, "created_at": "2026-05-25T08:30:00Z" }
  ],
  "total": 2
}
\`\`\`

---

### POST /api/tasks

Create a new task.

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| title | string | Yes | Task title |
| description | string | No | Task description |
| priority | string | No | Priority level: low, medium, high |

**Request**

\`\`\`bash
curl -X POST https://api.example.com/api/tasks \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread", "priority": "high"}'
\`\`\`

**Response** \`201 Created\`

\`\`\`json
{
  "id": 3,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "high",
  "completed": false,
  "created_at": "2026-05-26T12:00:00Z"
}
\`\`\`

---

### DELETE /api/tasks/:id

Delete a task by ID.

**Path Parameters**

| Parameter | Type | Description |
|---|---|---|
| id | integer | The task ID to delete |

**Request**

\`\`\`bash
curl -X DELETE https://api.example.com/api/tasks/3 \\
  -H "Authorization: Bearer <token>"
\`\`\`

**Response** \`200 OK\`

\`\`\`json
{
  "message": "Task deleted successfully",
  "id": 3
}
\`\`\`

---

## Error Responses

| Status | Description |
|---|---|
| 400 | Bad Request — Invalid input |
| 401 | Unauthorized — Missing or invalid token |
| 404 | Not Found — Task does not exist |
| 500 | Internal Server Error |

---

## Rate Limiting

- 100 requests per minute per API key
- Exceeding the limit returns \`429 Too Many Requests\``;

export default function Home() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [currentMethod, setCurrentMethod] = useState("GET");
  const [currentPath, setCurrentPath] = useState("");
  const [currentDesc, setCurrentDesc] = useState("");
  const [currentHeaders, setCurrentHeaders] = useState<Header[]>([{ key: "", value: "" }]);
  const [currentBody, setCurrentBody] = useState("");
  const [currentResponse, setCurrentResponse] = useState("");
  const [docs, setDocs] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("My API");
  const [projectDesc, setProjectDesc] = useState("A RESTful API service");
  const [showDocs, setShowDocs] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const nextEndpointId = useRef(SAMPLE_ENDPOINTS.length + 1);

  const addHeader = () => {
    setCurrentHeaders([...currentHeaders, { key: "", value: "" }]);
  };

  const updateHeader = (index: number, field: "key" | "value", val: string) => {
    const updated = [...currentHeaders];
    updated[index][field] = val;
    setCurrentHeaders(updated);
  };

  const removeHeader = (index: number) => {
    if (currentHeaders.length > 1) {
      setCurrentHeaders(currentHeaders.filter((_, i) => i !== index));
    }
  };

  const addEndpoint = () => {
    if (!currentPath.trim()) return;

    const newEndpoint: Endpoint = {
      id: nextEndpointId.current++,
      method: currentMethod,
      path: currentPath,
      description: currentDesc,
      headers: currentHeaders.filter((h) => h.key.trim()),
      body: currentBody,
      response: currentResponse,
    };

    if (editId) {
      setEndpoints(endpoints.map((e) => (e.id === editId ? { ...newEndpoint, id: editId } : e)));
      setEditId(null);
    } else {
      setEndpoints([...endpoints, newEndpoint]);
    }

    resetForm();
  };

  const resetForm = () => {
    setCurrentMethod("GET");
    setCurrentPath("");
    setCurrentDesc("");
    setCurrentHeaders([{ key: "", value: "" }]);
    setCurrentBody("");
    setCurrentResponse("");
  };

  const editEndpoint = (ep: Endpoint) => {
    setEditId(ep.id);
    setCurrentMethod(ep.method);
    setCurrentPath(ep.path);
    setCurrentDesc(ep.description);
    setCurrentHeaders(ep.headers.length > 0 ? ep.headers : [{ key: "", value: "" }]);
    setCurrentBody(ep.body);
    setCurrentResponse(ep.response);
  };

  const removeEndpoint = (id: number) => {
    setEndpoints(endpoints.filter((e) => e.id !== id));
  };

  const loadSample = () => {
    setEndpoints(SAMPLE_ENDPOINTS);
    setProjectName("User Management API");
    setProjectDesc("RESTful API for managing user accounts, roles, and permissions");
  };

  const handleExample = () => {
    setEndpoints(SAMPLE_TASK_ENDPOINTS);
    setProjectName("Task Manager API");
    setProjectDesc("RESTful API for managing tasks with CRUD operations");
    setDocs(SAMPLE_TASK_DOCS);
    setShowDocs(true);
  };

  const generateDocs = async () => {
    if (endpoints.length === 0) return;
    setLoading(true);
    setShowDocs(false);

    const endpointsDesc = endpoints
      .map(
        (ep) =>
          `Method: ${ep.method}\nPath: ${ep.path}\nDescription: ${ep.description}\nHeaders: ${ep.headers.map((h) => `${h.key}: ${h.value}`).join(", ") || "None"}\nRequest Body: ${ep.body || "None"}\nResponse Example: ${ep.response || "None"}`
      )
      .join("\n---\n");

    const prompt = `Generate comprehensive API documentation in Markdown format for:

Project: ${projectName}
Description: ${projectDesc}

Endpoints:
${endpointsDesc}

Include:
1. Overview section with base URL and authentication info
2. For each endpoint: full description, request parameters, request body schema, response schema, error codes, and curl example
3. Common error responses section
4. Rate limiting info

Format as clean Markdown with headers, tables, and code blocks. Use triple backticks for code blocks.`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setDocs(data.content || "Failed to generate docs.");
      setShowDocs(true);
    } catch {
      setDocs("Error: Failed to connect to AI service.");
      setShowDocs(true);
    } finally {
      setLoading(false);
    }
  };

  const copyDocs = () => {
    navigator.clipboard.writeText(docs);
  };

  const exportDocs = () => {
    const blob = new Blob([docs], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-api-docs.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#333] bg-[#111]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[var(--crimson)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">APISmith</h1>
              <p className="text-[11px] text-[var(--text-muted)]">AI-Powered API Documentation Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--crimson)] pulse-dot"></div>
            <span className="text-[11px] text-[var(--text-muted)]">SYSTEM ONLINE</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel — Input */}
        <div className="space-y-5">
          {/* Try Example Button */}
          <button
            onClick={handleExample}
            className="w-full border border-dashed border-[var(--crimson)] hover:border-solid hover:bg-[var(--crimson)]/10 text-[var(--crimson-light)] text-sm font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            ⚡ Try Example — Task Manager API
          </button>

          {/* Project Info */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 glow-red">
            <h2 className="text-sm font-bold text-[var(--crimson-light)] mb-3 flex items-center gap-2">
              <span className="text-[var(--crimson)]">{"//"}</span> PROJECT CONFIG
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full mt-1 bg-[#0A0A0A] border border-[var(--border)] rounded px-3 py-2 text-sm text-white focus:border-[var(--crimson)] focus:outline-none transition"
                  placeholder="My API"
                />
              </div>
              <div>
                <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full mt-1 bg-[#0A0A0A] border border-[var(--border)] rounded px-3 py-2 text-sm text-white focus:border-[var(--crimson)] focus:outline-none transition"
                  placeholder="A RESTful API service"
                />
              </div>
            </div>
          </div>

          {/* Endpoint Builder */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 glow-red">
            <h2 className="text-sm font-bold text-[var(--crimson-light)] mb-3 flex items-center gap-2">
              <span className="text-[var(--crimson)]">{"//"}</span> {editId ? "EDIT ENDPOINT" : "ADD ENDPOINT"}
            </h2>

            <div className="space-y-3">
              {/* Method + Path */}
              <div className="flex gap-2">
                <select
                  value={currentMethod}
                  onChange={(e) => setCurrentMethod(e.target.value)}
                  className="bg-[#0A0A0A] border border-[var(--border)] rounded px-3 py-2 text-sm font-bold focus:border-[var(--crimson)] focus:outline-none transition"
                >
                  {METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={currentPath}
                  onChange={(e) => setCurrentPath(e.target.value)}
                  className="flex-1 bg-[#0A0A0A] border border-[var(--border)] rounded px-3 py-2 text-sm text-white focus:border-[var(--crimson)] focus:outline-none transition"
                  placeholder="/api/resource"
                />
              </div>

              {/* Description */}
              <input
                type="text"
                value={currentDesc}
                onChange={(e) => setCurrentDesc(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[var(--border)] rounded px-3 py-2 text-sm text-white focus:border-[var(--crimson)] focus:outline-none transition"
                placeholder="Endpoint description..."
              />

              {/* Headers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Headers</label>
                  <button onClick={addHeader} className="text-[11px] text-[var(--crimson-light)] hover:text-white transition">
                    + Add
                  </button>
                </div>
                {currentHeaders.map((h, i) => (
                  <div key={i} className="flex gap-2 mb-1">
                    <input
                      type="text"
                      value={h.key}
                      onChange={(e) => updateHeader(i, "key", e.target.value)}
                      className="flex-1 bg-[#0A0A0A] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-white focus:border-[var(--crimson)] focus:outline-none"
                      placeholder="Key"
                    />
                    <input
                      type="text"
                      value={h.value}
                      onChange={(e) => updateHeader(i, "value", e.target.value)}
                      className="flex-1 bg-[#0A0A0A] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-white focus:border-[var(--crimson)] focus:outline-none"
                      placeholder="Value"
                    />
                    <button onClick={() => removeHeader(i)} className="text-[var(--text-muted)] hover:text-[var(--crimson-light)] transition px-1">
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Request Body */}
              <div>
                <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Request Body (JSON)</label>
                <textarea
                  value={currentBody}
                  onChange={(e) => setCurrentBody(e.target.value)}
                  className="w-full mt-1 bg-[#0A0A0A] border border-[var(--border)] rounded px-3 py-2 text-sm text-white font-mono focus:border-[var(--crimson)] focus:outline-none transition h-20 resize-none"
                  placeholder='{"key": "value"}'
                />
              </div>

              {/* Response Example */}
              <div>
                <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Response Example (JSON)</label>
                <textarea
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  className="w-full mt-1 bg-[#0A0A0A] border border-[var(--border)] rounded px-3 py-2 text-sm text-white font-mono focus:border-[var(--crimson)] focus:outline-none transition h-20 resize-none"
                  placeholder='{"result": "success"}'
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addEndpoint}
                  disabled={!currentPath.trim()}
                  className="flex-1 bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] disabled:opacity-40 text-white text-sm font-bold py-2 rounded transition"
                >
                  {editId ? "✓ Update Endpoint" : "+ Add Endpoint"}
                </button>
                {editId && (
                  <button
                    onClick={() => {
                      resetForm();
                      setEditId(null);
                    }}
                    className="px-4 bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-secondary)] text-sm rounded transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={loadSample}
              className="flex-1 border border-[var(--border)] hover:border-[var(--crimson)] text-[var(--text-secondary)] hover:text-white text-xs py-2 rounded transition"
            >
              ⚡ Load Sample API
            </button>
            <button
              onClick={() => {
                setEndpoints([]);
                setShowDocs(false);
                setDocs("");
              }}
              className="flex-1 border border-[var(--border)] hover:border-red-900 text-[var(--text-muted)] hover:text-red-400 text-xs py-2 rounded transition"
            >
              🗑 Clear All
            </button>
          </div>

          {/* Endpoint List */}
          {endpoints.length > 0 && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
              <h2 className="text-sm font-bold text-[var(--crimson-light)] mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-[var(--crimson)]">{"//"}</span> ENDPOINTS ({endpoints.length})
                </span>
                <button
                  onClick={generateDocs}
                  disabled={loading}
                  className="bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] disabled:opacity-40 text-white text-xs font-bold px-4 py-1.5 rounded transition"
                >
                  {loading ? "⏳ Generating..." : "🤖 Generate Docs"}
                </button>
              </h2>
              <div className="space-y-2">
                {endpoints.map((ep) => (
                  <div key={ep.id} className="endpoint-line flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className={`method-badge ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
                      <span className="text-sm text-white font-mono">{ep.path}</span>
                      {ep.description && <span className="text-xs text-[var(--text-muted)]">— {ep.description}</span>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => editEndpoint(ep)} className="text-[10px] text-[var(--text-muted)] hover:text-white px-1">
                        ✎
                      </button>
                      <button onClick={() => removeEndpoint(ep.id)} className="text-[10px] text-[var(--text-muted)] hover:text-red-400 px-1">
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel — Output */}
        <div className="space-y-4">
          {!showDocs && !loading && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-8 text-center glow-red h-[600px] flex flex-col items-center justify-center">
              <div className="text-6xl mb-4 opacity-30">⚡</div>
              <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-2">API Documentation Generator</h3>
              <p className="text-sm text-[var(--text-muted)] max-w-sm">
                Add your API endpoints on the left, then click{" "}
                <span className="text-[var(--crimson-light)]">Generate Docs</span> to create comprehensive documentation using AI.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--crimson)] pulse-dot"></div>
                Awaiting endpoints...
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-8 text-center glow-red-intense h-[600px] flex flex-col items-center justify-center">
              <div className="text-4xl mb-4 animate-pulse">🤖</div>
              <h3 className="text-lg font-bold text-[var(--crimson-light)] mb-2">Generating Documentation...</h3>
              <p className="text-sm text-[var(--text-muted)]">AI is analyzing {endpoints.length} endpoint{endpoints.length > 1 ? "s" : ""}</p>
              <div className="mt-4 w-48 h-1 bg-[var(--bg-tertiary)] rounded overflow-hidden">
                <div className="h-full bg-[var(--crimson)] rounded animate-pulse" style={{ width: "60%" }}></div>
              </div>
            </div>
          )}

          {showDocs && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg overflow-hidden glow-red">
              {/* Toolbar */}
              <div className="border-b border-[var(--border)] px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--crimson)] font-bold text-sm">📄</span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {projectName.toLowerCase().replace(/\s+/g, "-")}-api-docs.md
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyDocs} className="text-[11px] text-[var(--text-muted)] hover:text-white border border-[var(--border)] hover:border-[var(--crimson)] px-3 py-1 rounded transition">
                    📋 Copy
                  </button>
                  <button onClick={exportDocs} className="text-[11px] text-[var(--text-muted)] hover:text-white border border-[var(--border)] hover:border-[var(--crimson)] px-3 py-1 rounded transition">
                    💾 Export .md
                  </button>
                </div>
              </div>
              {/* Content */}
              <div className="p-5 max-h-[550px] overflow-y-auto markdown-docs" style={{ whiteSpace: "pre-wrap" }}>
                {docs}
              </div>
            </div>
          )}

          {/* Stats */}
          {endpoints.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {METHODS.filter((m) => endpoints.some((e) => e.method === m)).map((m) => (
                <div key={m} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3 text-center">
                  <span className={`method-badge ${METHOD_COLORS[m]}`}>{m}</span>
                  <div className="text-lg font-bold text-white mt-1">{endpoints.filter((e) => e.method === m).length}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-[var(--border)]">
        <p className="text-[11px] text-[var(--text-muted)]">
          APISmith — Documented by MiMo v2.5 Pro
        </p>
      </footer>
    </div>
  );
}
