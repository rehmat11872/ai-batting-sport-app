import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "session_token";

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      await prisma.userSession.deleteMany({
        where: { token },
      });
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set("whop_access_token", "", { maxAge: 0, path: "/" });
  return response;
}

export async function GET() {
  // Support GET for easier logout links
  return POST();
}
