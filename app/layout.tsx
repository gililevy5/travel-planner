import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import FirebaseAnalytics from "@/components/FirebaseAnalytics";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TripAI — Plan Your Perfect Trip",
  description: "AI-powered travel planning. Describe your dream trip and get personalized destination suggestions with day-by-day itineraries and budget breakdowns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.className} h-full`}>
      <body className="min-h-full antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
