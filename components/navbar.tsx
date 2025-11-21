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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserSession {
  userId: string;
  isSubscribed: boolean;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export function Navbar() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch session on client side
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

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
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
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
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_URL ?? "https://whop.com"} target="_blank" rel="noreferrer">
                      Upgrade on Whop
                    </Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

