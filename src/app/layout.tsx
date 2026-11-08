import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { GiftoraProvider } from "@/context/GiftoraContext";
import { ThemeProvider } from "@/context/ThemeContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

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
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${plusJakarta.variable}`}>
      <head>
        <Script id="giftora-theme-init" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var stored = localStorage.getItem('giftora_theme');
                var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch(e) {}
            })();
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-[var(--bg-ivory)] text-[var(--text-charcoal)] font-sans antialiased selection:bg-[#9B668B] selection:text-white flex flex-col transition-colors duration-200">
        <ThemeProvider>
          <GiftoraProvider>
            {children}
          </GiftoraProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
