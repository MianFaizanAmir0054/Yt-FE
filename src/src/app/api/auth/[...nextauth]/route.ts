import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Proxy all auth requests to the Better Auth backend
async function proxyToBackend(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/auth", "");
  const backendUrl = `${API_URL}/api/auth${path}${url.search}`;

  const headers = new Headers(request.headers);
  
  const response = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: request.method !== "GET" && request.method !== "HEAD" 
      ? await request.text() 
      : undefined,
  });

  const responseHeaders = new Headers(response.headers);
  
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest) {
  return proxyToBackend(request);
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request);
}
