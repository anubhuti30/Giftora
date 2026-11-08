"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  Heart, 
  Layers, 
  User, 
  Menu, 
  X, 
  ArrowRight,
  Compass,
  Calendar,
  HelpCircle,
  LogOut,
  Settings
} from "lucide-react";
import { useGiftora } from "@/context/GiftoraContext";

export function Navbar() {
  const pathname = usePathname();
  const { wishlist, compareList, user, logoutUser } = useGiftora();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8F5F0]/90 backdrop-blur-md border-b border-[#E6DDE5]/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-xl bg-[#422C42] flex items-center justify-center text-[#E9DDE7] shadow-sm group-hover:bg-[#9B668B] transition-colors">
              <Sparkles className="w-5 h-5 text-[#E9DDE7]" />
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#422C42] leading-none">
                Giftora
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#9B668B] font-semibold mt-0.5">
                Thoughtful Gifts
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/discover"
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
                pathname.startsWith("/discover")
                  ? "text-[#422C42] font-semibold bg-[#E9DDE7]/50"
                  : "text-[#6E6770] hover:text-[#422C42] hover:bg-[#F2E8F0]/40"
              }`}
            >
              <Compass className="w-4 h-4 text-[#9B668B]" />
              Discover Gifts
            </Link>

            <Link
              href="/#occasions"
              className="text-[#6E6770] hover:text-[#422C42] py-1 px-2.5 rounded-lg hover:bg-[#F2E8F0]/40 transition-colors"
            >
              Occasions
            </Link>

            <Link
              href="/#curated"
              className="text-[#6E6770] hover:text-[#422C42] py-1 px-2.5 rounded-lg hover:bg-[#F2E8F0]/40 transition-colors"
            >
              Curated Collections
            </Link>

            <Link
              href="/#how-it-works"
              className="text-[#6E6770] hover:text-[#422C42] py-1 px-2.5 rounded-lg hover:bg-[#F2E8F0]/40 transition-colors"
            >
              How It Works
            </Link>

            <Link
              href="/#advantages"
              className="text-[#6E6770] hover:text-[#422C42] py-1 px-2.5 rounded-lg hover:bg-[#F2E8F0]/40 transition-colors"
            >
              About
            </Link>
          </nav>
        </div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Compare Link */}
          <Link
            href="/compare"
            title="Compare Gifts"
            className={`relative p-2.5 rounded-xl border transition-all ${
              compareList.length > 0
                ? "bg-[#E9DDE7]/70 border-[#9B668B]/40 text-[#422C42]"
                : "bg-white/80 border-[#E6DDE5] text-[#6E6770] hover:border-[#9B668B]/40 hover:text-[#422C42]"
            }`}
          >
            <Layers className="w-4 h-4" />
            {compareList.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#9B668B] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                {compareList.length}
              </span>
            )}
          </Link>

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            title="Saved Wishlist"
            className={`relative p-2.5 rounded-xl border transition-all ${
              wishlist.length > 0
                ? "bg-white border-[#E6DDE5] text-[#9B668B]"
                : "bg-white/80 border-[#E6DDE5] text-[#6E6770] hover:text-[#9B668B]"
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlist.length > 0 ? "fill-[#9B668B] text-[#9B668B]" : ""}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#422C42] text-[#E9DDE7] text-[11px] font-bold flex items-center justify-center shadow-sm">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* User Auth / Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-xl bg-white border border-[#E6DDE5] hover:border-[#9B668B]/50 transition-colors"
              >
                <span className="text-xs font-medium text-[#422C42] hidden sm:inline max-w-[100px] truncate">
                  {user.name}
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#E9DDE7] text-[#422C42] font-semibold text-xs flex items-center justify-center overflow-hidden">
                  {user.name.charAt(0)}
                </div>
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-[#E6DDE5] p-2 z-50 animate-in fade-in"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#E6DDE5] mb-1">
                    <p className="text-sm font-semibold text-[#422C42]">{user.name}</p>
                    <p className="text-xs text-[#6E6770] truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/recipients"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#422C42] hover:bg-[#F8F5F0] rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 text-[#9B668B]" />
                    Recipient Profiles
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#422C42] hover:bg-[#F8F5F0] rounded-lg transition-colors"
                  >
                    <Heart className="w-4 h-4 text-[#9B668B]" />
                    Saved Wishlist ({wishlist.length})
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#422C42] hover:bg-[#F8F5F0] rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#9B668B]" />
                    Account & Preferences
                  </Link>
                  <button
                    onClick={() => logoutUser()}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-left border-t border-[#E6DDE5] mt-1 pt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold text-[#422C42] hover:text-[#9B668B] px-3 py-2 rounded-lg transition-colors hidden sm:inline"
            >
              Sign In
            </Link>
          )}

          {/* Primary Action Button */}
          <Link
            href="/discover"
            className="hidden sm:inline-flex items-center gap-2 bg-[#422C42] hover:bg-[#9B668B] text-[#FAF8F5] text-xs font-semibold px-4 py-2.5 rounded-xl shadow-soft transition-all duration-200 active:scale-95"
          >
            <span>Find a Gift</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-white border border-[#E6DDE5] text-[#422C42] md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F8F5F0] border-b border-[#E6DDE5] px-5 py-6 space-y-4 shadow-elevated animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2 text-base font-medium">
            <Link
              href="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#E9DDE7]/60 text-[#422C42] font-semibold"
            >
              <Compass className="w-5 h-5 text-[#9B668B]" />
              AI Gift Assistant
            </Link>
            <Link
              href="/#occasions"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#6E6770] hover:text-[#422C42]"
            >
              <Calendar className="w-5 h-5 text-[#9B668B]" />
              Occasions
            </Link>
            <Link
              href="/#curated"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#6E6770] hover:text-[#422C42]"
            >
              <Sparkles className="w-5 h-5 text-[#9B668B]" />
              Curated Collections
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#6E6770] hover:text-[#422C42]"
            >
              <HelpCircle className="w-5 h-5 text-[#9B668B]" />
              How It Works
            </Link>
            <Link
              href="/recipients"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#6E6770] hover:text-[#422C42]"
            >
              <User className="w-5 h-5 text-[#9B668B]" />
              Recipient Profiles
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#6E6770] hover:text-[#422C42]"
            >
              <Heart className="w-5 h-5 text-[#9B668B]" />
              Wishlist ({wishlist.length})
            </Link>
            <Link
              href="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#6E6770] hover:text-[#422C42]"
            >
              <Layers className="w-5 h-5 text-[#9B668B]" />
              Comparison ({compareList.length})
            </Link>
          </nav>

          <div className="pt-4 border-t border-[#E6DDE5] flex flex-col gap-2.5">
            {user ? (
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-[#422C42]">{user.name}</p>
                  <p className="text-xs text-[#6E6770]">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-700 font-semibold px-3 py-1.5 border border-rose-200 rounded-lg bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 rounded-xl border border-[#E6DDE5] text-sm font-semibold text-[#422C42] bg-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 rounded-xl bg-[#9B668B] text-sm font-semibold text-white shadow-soft"
                >
                  Sign Up
                </Link>
              </div>
            )}
            <Link
              href="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-[#422C42] text-white font-medium text-sm shadow-soft flex items-center justify-center gap-2"
            >
              <span>Start Gift Discovery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
