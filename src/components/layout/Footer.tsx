"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#422C42] text-[#F8F5F0] border-t border-[#5B405B] mt-auto">
      {/* Newsletter Bar */}
      <div className="border-b border-[#5B405B]/60 bg-[#362236]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="font-serif text-lg font-bold text-[#FAF8F5]">
              Thoughtful Gifting Field Notes
            </h3>
            <p className="text-xs text-[#E9DDE7]/80 mt-0.5">
              Seasonal curations and celebration reminders in your inbox.
            </p>
          </div>

          <div className="w-full sm:w-auto min-w-[280px]">
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium py-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Subscribed! Welcome to Giftora.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="bg-[#422C42] border border-[#5B405B] rounded-xl px-3.5 py-2 text-xs text-[#FAF8F5] placeholder-[#E9DDE7]/50 focus:outline-none focus:border-[#B77B9F] w-full"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="bg-[#B77B9F] hover:bg-[#9B668B] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center justify-center transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Clean 5-Column Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        
        {/* 1. Brand */}
        <div className="col-span-2 md:col-span-1 space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#E9DDE7] flex items-center justify-center text-[#422C42]">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="font-serif text-xl font-bold tracking-tight text-[#FAF8F5]">
              Giftora
            </span>
          </Link>
          <p className="text-xs text-[#E9DDE7]/80 leading-relaxed">
            AI-powered personalized gift discovery across verified artisans and retail destinations.
          </p>
        </div>

        {/* 2. Discover */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9DDE7] mb-3">
            Discover
          </h4>
          <ul className="space-y-2 text-xs text-[#E9DDE7]/80">
            <li>
              <Link href="/discover" className="hover:text-white transition-colors">
                AI Assistant
              </Link>
            </li>
            <li>
              <Link href="/discover/results" className="hover:text-white transition-colors">
                Gift Catalog
              </Link>
            </li>
            <li>
              <Link href="/compare" className="hover:text-white transition-colors">
                Compare Matrix
              </Link>
            </li>
            <li>
              <Link href="/#collections" className="hover:text-white transition-colors">
                Curated Collections
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. Occasions */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9DDE7] mb-3">
            Occasions
          </h4>
          <ul className="space-y-2 text-xs text-[#E9DDE7]/80">
            <li>
              <Link href="/discover?occasion=Birthday" className="hover:text-white transition-colors">
                Birthdays
              </Link>
            </li>
            <li>
              <Link href="/discover?occasion=Anniversary" className="hover:text-white transition-colors">
                Anniversaries
              </Link>
            </li>
            <li>
              <Link href="/discover?occasion=Wedding" className="hover:text-white transition-colors">
                Weddings
              </Link>
            </li>
            <li>
              <Link href="/discover?occasion=Festivals" className="hover:text-white transition-colors">
                Festivals & Diwali
              </Link>
            </li>
            <li>
              <Link href="/discover?occasion=Thank%20You" className="hover:text-white transition-colors">
                Thank You
              </Link>
            </li>
          </ul>
        </div>

        {/* 4. Account */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9DDE7] mb-3">
            Account
          </h4>
          <ul className="space-y-2 text-xs text-[#E9DDE7]/80">
            <li>
              <Link href="/recipients" className="hover:text-white transition-colors">
                Recipients
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-white transition-colors">
                Saved Wishlist
              </Link>
            </li>
            <li>
              <Link href="/settings" className="hover:text-white transition-colors">
                Preferences
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
            </li>
          </ul>
        </div>

        {/* 5. Legal */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9DDE7] mb-3">
            Legal & Trust
          </h4>
          <ul className="space-y-2 text-xs text-[#E9DDE7]/80">
            <li>
              <span className="text-[#E9DDE7]/70">Verified Sourcing</span>
            </li>
            <li>
              <span className="text-[#E9DDE7]/70">Privacy Protocol</span>
            </li>
            <li>
              <span className="text-[#E9DDE7]/70">Terms of Service</span>
            </li>
            <li>
              <span className="text-[#E9DDE7]/70">Editorial Ethics</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#5B405B]/60 bg-[#2E1B2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#E9DDE7]/60">
          <p>© 2026 Giftora. Curated with love.</p>
          <p className="text-[11px]">Photography via Unsplash & Pexels verified creators.</p>
        </div>
      </div>
    </footer>
  );
}
