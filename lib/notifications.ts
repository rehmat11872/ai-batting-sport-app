import { prisma } from "@/lib/prisma";
import type { Sport } from "@/types/insiders";

export interface UserNotification {
  id: string;
  type: "injury" | "lineup" | "weather" | "breaking";
  title: string;
  message: string;
  sport?: string;
  matchup?: string;
  isRead: boolean;
  createdAt: string;
  alertId?: string;
}

/**
 * Create notification from insider alert
 */
export async function createNotificationFromAlert(
  userId: string,
  alert: {
    id: string;
    sport: string;
    text: string;
    matchedKeywords: string[];
    urgencyScore: number;
  }
): Promise<string> {
  // Determine notification type based on keywords
  let type: "injury" | "lineup" | "weather" | "breaking" = "breaking";
  const keywords = alert.matchedKeywords.map(k => k.toLowerCase());
  
  if (keywords.some(k => ["injury", "injured", "out", "dnp", "ir", "concussion"].includes(k))) {
    type = "injury";
  } else if (keywords.some(k => ["starting", "lineup", "benched", "inactive"].includes(k))) {
    type = "lineup";
  } else if (keywords.some(k => ["weather", "postponed", "delayed"].includes(k))) {
    type = "weather";
  }
  
  // Generate title based on type
  const titles: Record<typeof type, string> = {
    injury: "🚨 Injury Alert",
    lineup: "📋 Lineup Change",
    weather: "🌧️ Weather Update",
    breaking: "⚡ Breaking News",
  };
  
  const result = await prisma.userNotification.create({
    data: {
      userId,
      alertId: alert.id,
      type,
      title: titles[type],
      message: alert.text.slice(0, 500),
      sport: alert.sport,
      isRead: false,
    },
  });
  
  return result.id;
}

/**
 * Get unread notifications for user
 */
export async function getUnreadNotifications(
  userId: string,
  limit: number = 10
): Promise<UserNotification[]> {
  const notifications = await prisma.userNotification.findMany({
    where: {
      userId,
      isRead: false,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  
  return notifications.map(n => ({
    id: n.id,
    type: n.type as UserNotification["type"],
    title: n.title,
    message: n.message,
    sport: n.sport || undefined,
    matchup: n.matchup || undefined,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
    alertId: n.alertId || undefined,
  }));
}

/**
 * Get all notifications for user
 */
export async function getAllNotifications(
  userId: string,
  limit: number = 50
): Promise<UserNotification[]> {
  const notifications = await prisma.userNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  
  return notifications.map(n => ({
    id: n.id,
    type: n.type as UserNotification["type"],
    title: n.title,
    message: n.message,
    sport: n.sport || undefined,
    matchup: n.matchup || undefined,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
    alertId: n.alertId || undefined,
  }));
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  await prisma.userNotification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

/**
 * Mark all notifications as read for user
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.userNotification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

/**
 * Get notification count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.userNotification.count({
    where: { userId, isRead: false },
  });
}

/**
 * Check if alert should trigger notification (pre-match timing)
 * Returns true if alert is 1-2 hours before a game
 */
export function shouldNotifyForAlert(
  alert: { sport: string; urgencyScore: number; windowTag?: string | null },
  gameTimes: Date[]
): boolean {
  // High urgency alerts always notify
  if (alert.urgencyScore >= 7) return true;
  
  // Check if within pre-game window
  if (alert.windowTag) {
    // NFL_90_MIN, NBA_2H, SOC_2H indicate pre-game window
    return true;
  }
  
  // Check actual game times
  const now = new Date();
  const oneHour = 60 * 60 * 1000;
  const twoHours = 2 * oneHour;
  
  for (const gameTime of gameTimes) {
    const timeUntilGame = gameTime.getTime() - now.getTime();
    if (timeUntilGame > 0 && timeUntilGame <= twoHours) {
      return true;
    }
  }
  
  return false;
}

