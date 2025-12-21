import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getAllNotifications,
  getUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const countOnly = searchParams.get("count") === "true";
    const limit = Math.min(50, Number(searchParams.get("limit") || 20));

    if (countOnly) {
      const count = await getUnreadNotificationCount(session.userId);
      return NextResponse.json({ count });
    }

    const notifications = unreadOnly
      ? await getUnreadNotifications(session.userId, limit)
      : await getAllNotifications(session.userId, limit);

    const count = await getUnreadNotificationCount(session.userId);

    return NextResponse.json({
      notifications,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// POST /api/notifications - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, notificationId } = body;

    if (action === "markRead" && notificationId) {
      await markNotificationRead(notificationId);
      return NextResponse.json({ success: true });
    }

    if (action === "markAllRead") {
      await markAllNotificationsRead(session.userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

