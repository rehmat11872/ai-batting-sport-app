// This route matches the redirect URI configured in Whop dashboard: /oauth/callback
// It forwards to the actual handler at /api/oauth/callback
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  // Forward to the actual callback handler
  const redirectUrl = new URL(`/api/oauth/callback${searchParams ? `?${searchParams}` : ""}`, request.url);
  return NextResponse.redirect(redirectUrl);
}

