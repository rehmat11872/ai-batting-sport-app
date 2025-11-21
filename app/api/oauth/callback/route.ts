import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { WhopServerSdk } from "@whop/api";
import { prisma } from "@/lib/prisma";

const whopApi = WhopServerSdk({
  appApiKey: process.env.WHOP_API_KEY!,
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
});

const SESSION_COOKIE = "session_token";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", baseUrl));
  }

  if (!state) {
    return NextResponse.redirect(new URL("/login?error=missing_state", baseUrl));
  }

  const stateCookie = request.headers
    .get("Cookie")
    ?.split(";")
    .find((cookie) => cookie.trim().startsWith(`oauth-state.${state}=`));

  if (!stateCookie) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", baseUrl));
  }

  const redirectUri = process.env.WHOP_REDIRECT_URI || "http://localhost:3000/oauth/callback";

  // Exchange the code for a token
  const authResponse = await whopApi.oauth.exchangeCode({
    code,
    redirectUri,
  });

  if (!authResponse.ok) {
    console.error("Whop code exchange failed", authResponse);
    return NextResponse.redirect(new URL("/login?error=code_exchange_failed", baseUrl));
  }

  const { access_token } = authResponse.tokens;
  
  console.log("OAuth exchange successful. Access token received.");

  // Fetch user data using the access token
  // Following Whop docs pattern but also fetching user info
  let whopUser: any = null;
  let whopCustomerId: string | null = null;
  
  try {
    // Try fetching user info with access token using v5 API
    const userRes = await fetch("https://api.whop.com/v5/me", {
      headers: { 
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    });
    
    if (userRes.ok) {
      whopUser = await userRes.json();
      whopCustomerId = whopUser.id?.toString() || whopUser.customer_id?.toString() || null;
      console.log("✅ User data fetched successfully!");
      console.log("📋 Full user response:", JSON.stringify(whopUser, null, 2));
      console.log("🔑 Extracted data:", {
        id: whopCustomerId,
        email: whopUser.email,
        username: whopUser.username,
        name: whopUser.name,
        profile_pic_url: whopUser.profile_pic_url,
        profile_image_url: whopUser.profile_image_url,
        avatar_url: whopUser.avatar_url,
      });
    } else {
      // Try v2 API as fallback
      const userResV2 = await fetch("https://api.whop.com/api/v2/me", {
        headers: { 
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });
      
      if (userResV2.ok) {
        whopUser = await userResV2.json();
        whopCustomerId = whopUser.id?.toString() || whopUser.customer_id?.toString() || null;
        console.log("✅ User data fetched via v2 API");
        console.log("📋 Full user response:", JSON.stringify(whopUser, null, 2));
      } else {
        const errorText = await userRes.text();
        console.log("⚠️ Could not fetch user with OAuth token");
        console.log("📋 Response status:", userRes.status);
        console.log("📋 Response body:", errorText);
        // Create temporary ID from token
        const tokenHash = Buffer.from(access_token).toString('base64').substring(0, 32);
        whopCustomerId = tokenHash;
        console.log("Using temporary customer ID:", whopCustomerId);
      }
    }
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    // Create temporary ID from token as fallback
    const tokenHash = Buffer.from(access_token).toString('base64').substring(0, 32);
    whopCustomerId = tokenHash;
  }

  // Ensure we have a customer ID
  if (!whopCustomerId) {
    const tokenHash = Buffer.from(access_token).toString('base64').substring(0, 32);
    whopCustomerId = tokenHash;
    console.log("Using fallback customer ID:", whopCustomerId);
  }

  // Try to fetch memberships using access token
  let activeMembership: any = null;
  try {
    const membershipsRes = await fetch("https://api.whop.com/api/v2/memberships", {
      headers: { 
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    });
    
    if (membershipsRes.ok) {
      const data = await membershipsRes.json();
      const memberships = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      activeMembership = memberships.find((m: any) => m.status === "active");
      
      if (activeMembership) {
        console.log("✅ Active membership found:", activeMembership.plan_id);
      } else {
        console.log("ℹ️ No active membership - user is on free tier");
      }
    }
  } catch (error) {
    console.error("⚠️ Error fetching memberships:", error);
  }

  // Upsert user in database using Prisma
  let user;
  try {
    // Prioritize username from Whop, then name, then email, then fallback
    const displayName = whopUser?.username || whopUser?.name || whopUser?.email || `User ${whopCustomerId.substring(0, 8)}`;
    
    const userData = {
      whopCustomerId: whopCustomerId,
      email: whopUser?.email || null,
      name: displayName,
      avatarUrl: whopUser?.profile_pic_url || whopUser?.profile_image_url || whopUser?.avatar_url || null,
    };

    console.log("💾 Preparing to save user to database");
    console.log("📋 User data to save:", JSON.stringify(userData, null, 2));
    console.log("🔍 Available whopUser fields:", whopUser ? Object.keys(whopUser) : "No whopUser data");

    user = await prisma.user.upsert({
      where: { whopCustomerId: whopCustomerId },
      update: {
        email: userData.email || undefined,
        name: userData.name || undefined,
        avatarUrl: userData.avatarUrl || undefined,
      },
      create: userData,
    });
    
    console.log("✅ User saved to database successfully!");
    console.log("📋 Saved user data:", JSON.stringify({
      id: user.id,
      whopCustomerId: user.whopCustomerId,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    }, null, 2));
  } catch (error) {
    console.error("❌ Error saving user to database:", error);
    // Log full error details
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.redirect(new URL("/login?error=user_save_failed", baseUrl));
  }

  // Upsert membership if we found an active one
  if (activeMembership) {
    try {
      await prisma.membership.upsert({
        where: { userId: user.id },
        update: {
          whopPlanId: activeMembership.plan_id?.toString() || activeMembership.plan?.id?.toString() || null,
          status: (activeMembership.status || "active") as any,
          accessExpiresAt: activeMembership.expires_at ? new Date(activeMembership.expires_at) : null,
        },
        create: {
          userId: user.id,
          whopPlanId: activeMembership.plan_id?.toString() || activeMembership.plan?.id?.toString() || null,
          status: (activeMembership.status || "active") as any,
          accessExpiresAt: activeMembership.expires_at ? new Date(activeMembership.expires_at) : null,
        },
      });
      console.log("Membership saved:", activeMembership.status);
    } catch (error) {
      console.error("Error saving membership:", error);
      // Continue even if membership save fails
    }
  } else {
    // No active membership found - user is on free tier
    // Webhook will update this when they subscribe
    console.log("No active membership found - user is on free tier");
  }

  // Create session in database
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

  try {
    console.log("🔐 Creating session:", {
      token: sessionToken.substring(0, 20) + "...",
      userId: user.id,
      expiresAt: expiresAt.toISOString(),
    });

    await prisma.userSession.upsert({
      where: { token: sessionToken },
      update: {
        expiresAt,
      },
      create: {
        token: sessionToken,
        userId: user.id,
        expiresAt,
      },
    });
    
    console.log("✅ Session created successfully");
  } catch (error) {
    console.error("❌ Error creating session:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    return NextResponse.redirect(new URL("/login?error=session_failed", baseUrl));
  }

  // Restore the `next` parameter from the state cookie
  const next = decodeURIComponent(stateCookie.split("=")[1]);
  const nextUrl = new URL(next, baseUrl);

  console.log("🔄 Redirecting to:", nextUrl.toString());
  console.log("🍪 Setting session cookie");

  // Add cache-busting query param to force refresh
  const redirectUrl = new URL(nextUrl.toString());
  redirectUrl.searchParams.set("_t", Date.now().toString());

  const response = NextResponse.redirect(redirectUrl.toString());
  
  // Set session cookie (CRITICAL for login detection)
  response.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
  
  // Also store access token for future API calls
  response.cookies.set("whop_access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
  
  // Clear state cookie
  response.cookies.set(`oauth-state.${state}`, "", { maxAge: 0, path: "/" });

  console.log("✅ OAuth callback complete - user logged in!");
  return response;
}
