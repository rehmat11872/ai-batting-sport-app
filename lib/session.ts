import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "session_token";

export interface SessionInfo {
  userId: string;
  isSubscribed: boolean;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export async function getSession(): Promise<SessionInfo | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  
  if (!token) {
    console.log("🔍 No session token found in cookies");
    return null;
  }

  console.log("🔍 Checking session with token:", token.substring(0, 20) + "...");

  try {
    // Find session in database
    const session = await prisma.userSession.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            memberships: {
              where: {
                status: "active",
                OR: [
                  { accessExpiresAt: null },
                  { accessExpiresAt: { gt: new Date() } },
                ],
              },
            },
          },
        },
      },
    });

    if (!session) {
      console.log("❌ Session not found in database");
      return null;
    }

    // Check if session expired
    if (session.expiresAt && session.expiresAt < new Date()) {
      console.log("❌ Session expired");
      await prisma.userSession.delete({ where: { token } });
      return null;
    }

    const isSubscribed = session.user.memberships.length > 0;

    console.log("✅ Session found:", {
      userId: session.userId,
      email: session.user.email,
      name: session.user.name,
      isSubscribed,
    });

    return {
      userId: session.userId,
      isSubscribed,
      email: session.user.email ?? undefined,
      name: session.user.name ?? undefined,
      avatarUrl: session.user.avatarUrl ?? undefined,
    };
  } catch (error) {
    console.error("❌ Error getting session:", error);
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session;
}
