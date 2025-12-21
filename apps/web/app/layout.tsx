import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/server/trpc/client";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/layout";
import { SmoothScrollProvider } from "@/lib/providers/smooth-scroll";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Kortex - AI-Powered Learning Platform",
  description:
    "Personalized AI learning platform with cutting-edge animations and modern UX. Master any skill with AI-crafted courses.",
  keywords: [
    "AI learning",
    "personalized education",
    "online courses",
    "skill development",
  ],
  authors: [{ name: "Yashwanth Aravind", url: "https://github.com/yash27007" }],
  openGraph: {
    title: "Kortex - AI-Powered Learning Platform",
    description:
      "Master any skill with AI-crafted courses tailored just for you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${inter.variable} font-sans bg-gray-900 text-white antialiased selection:bg-violet-500/30`}
        >
          <TRPCReactProvider>
            <SmoothScrollProvider>
              <Navbar />
              {children}
            </SmoothScrollProvider>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
