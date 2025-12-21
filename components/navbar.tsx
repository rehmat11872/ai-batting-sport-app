"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserSession {
  userId: string;
  isSubscribed: boolean;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  sport?: string;
  isRead: boolean;
  createdAt: string;
}

export function Navbar() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Fetch session on client side
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setSession(data.session);
        setLoading(false);
        
        // If logged in, fetch notifications
        if (data.session) {
          fetchNotifications();
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=5");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    router.push("/");
    router.refresh();
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold">
          AI Sports Betting
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!loading && (
            <>
              {session ? (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/betintel">BetIntel AI</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  
                  {/* Notification Bell */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80" align="end">
                      <DropdownMenuLabel className="flex items-center justify-between">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={markAllRead}>
                            Mark all read
                          </Button>
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notif) => (
                          <DropdownMenuItem key={notif.id} className="flex flex-col items-start p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{notif.title}</span>
                              {notif.sport && (
                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{notif.sport}</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {notif.message}
                            </p>
                          </DropdownMenuItem>
                        ))
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/betintel" className="w-full text-center text-sm text-primary">
                          View all in BetIntel
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={session.avatarUrl || ""} alt={session.name || session.email || "User"} />
                          <AvatarFallback>{getUserInitials(session.name, session.email)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={session.avatarUrl || ""} alt={session.name || session.email || "User"} />
                            <AvatarFallback>{getUserInitials(session.name, session.email)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {session.name || "User"}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {session.email}
                            </p>
                            {session.isSubscribed ? (
                              <span className="text-xs text-green-600 font-medium">Premium Active</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Free Tier</span>
                            )}
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/betintel">BetIntel AI</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile Settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!session.isSubscribed && (
                        <DropdownMenuItem asChild>
                          <Link href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_URL ?? "https://whop.com"} target="_blank" rel="noreferrer" className="text-primary font-medium">
                            ⭐ Upgrade to Premium
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button asChild variant="default" size="sm">
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

