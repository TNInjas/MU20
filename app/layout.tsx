import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/navigation/header";
import { Toaster } from "sonner";
import { PostLoginRedirect } from "@/components/auth/post-login-redirect";
import { FloatingChatbox } from "@/components/chat/floating-chatbox";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumos - AI Financial Advisor | Dave Ramsey's 7 Steps",
  description:
    "Navigate your financial journey through Dave Ramsey's 7 Baby Steps. Built for college students to build wealth and achieve financial freedom.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main>{children}</main>
        <Toaster />
        <PostLoginRedirect />
        <FloatingChatbox />
      </body>
    </html>
  );
}
