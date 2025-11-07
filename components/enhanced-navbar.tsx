"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Wallet, User, LogOut, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mockNotifications, mockStats } from "@/lib/mockData";

export function EnhancedNavbar() {
  const { data: session, status } = useSession();
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold">
            🏆 AI Sports Betting
          </Link>
          {session && (
            <div className="hidden md:flex gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/matches"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Live Matches
              </Link>
              <Link
                href="/bets"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                My Bets
              </Link>
              <Link
                href="/wallet"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Wallet
              </Link>
              <Link
                href="/favorites"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Favorites
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {status === "loading" ? (
            <div className="w-20 h-9" />
          ) : session ? (
            <>
              <Link href="/wallet">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">{mockStats.walletBalance}</span>
                </Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {session.user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wallet" className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      Wallet
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => signIn()}>
                Sign In
              </Button>
              <Button onClick={() => (window.location.href = "/auth/register")}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

