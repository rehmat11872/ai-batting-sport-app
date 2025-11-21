import { NextRequest, NextResponse } from "next/server";
import { WhopServerSdk } from "@whop/api";

const whopApi = WhopServerSdk({
  appApiKey: process.env.WHOP_API_KEY!,
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  // Support both "next" and "redirect" query params
  const next = url.searchParams.get("next") || url.searchParams.get("redirect") || "/dashboard";

  if (!process.env.WHOP_API_KEY || !process.env.NEXT_PUBLIC_WHOP_APP_ID) {
    return NextResponse.json(
      { error: "Whop OAuth configuration missing. Set WHOP_API_KEY and NEXT_PUBLIC_WHOP_APP_ID" },
      { status: 500 }
    );
  }

  const redirectUri = process.env.WHOP_REDIRECT_URI || "http://localhost:3000/oauth/callback";

  const { url: authUrl, state } = whopApi.oauth.getAuthorizationUrl({
    redirectUri,
    scope: ["read_user"],
  });

  // The state is used to restore the `next` parameter after the user lands on the callback route.
  return NextResponse.redirect(authUrl, {
    headers: {
      "Set-Cookie": `oauth-state.${state}=${encodeURIComponent(
        next
      )}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`,
    },
  });
}

