import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ANIMA",
  description: "Your AI companion's memories belong to you — cryptographically, forever.",
};

import Providers from "@/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, "dark")}>
      <body className="antialiased font-sans min-h-screen bg-background text-foreground flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
