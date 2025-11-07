"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            AI Sports Betting
          </Link>
          <div className="flex gap-4">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {status === "loading" ? (
            <div className="w-20 h-9" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session.user?.email}
              </span>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={() => signIn()}>Sign In</Button>
          )}
        </div>
      </div>
    </nav>
  );
}

