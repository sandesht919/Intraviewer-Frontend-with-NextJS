"use client";

import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthLayout from "@/components/AuthLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerStateChange = (isOpen: boolean) => {
    setIsDrawerOpen(isOpen);
  };

  return (
    <html lang="en">
      <head>
        <title>IntraViewer - AI Interview Practice Platform</title>
        <meta name="description" content="Practice interviews with AI-powered feedback and land your dream job" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar onDrawerStateChange={handleDrawerStateChange} />
        <AuthLayout isDrawerOpen={isDrawerOpen}>
          {children}
        </AuthLayout>
      </body>
    </html>
  );
}
