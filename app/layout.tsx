import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { EnhancedNavbar } from "@/components/enhanced-navbar";

export const metadata: Metadata = {
  title: "AI Sports Betting App",
  description: "Your daily AI-powered predictions dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <EnhancedNavbar />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

