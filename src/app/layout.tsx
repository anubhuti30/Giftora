import type { Metadata } from "next";
import "./globals.css";
import { GiftoraProvider } from "@/context/GiftoraContext";

export const metadata: Metadata = {
  title: "Giftora | AI-Powered Personalized Gift Discovery & Shopping",
  description:
    "Discover thoughtful, personalized gifts from top marketplaces tailored to your loved one's unique personality, interests, and special occasions.",
  keywords: [
    "gift discovery",
    "personalized gifts",
    "AI shopping assistant",
    "gift guide",
    "thoughtful gifts",
    "Giftora",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8F5F0] text-[#29252A] font-sans antialiased selection:bg-[#9B668B] selection:text-white flex flex-col">
        <GiftoraProvider>
          {children}
        </GiftoraProvider>
      </body>
    </html>
  );
}
