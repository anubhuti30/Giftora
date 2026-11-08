"use client";

import React, { useState, useEffect } from "react";
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
  Settings,
  Sun,
  Moon,
  Monitor,
  Grid,
  Film
} from "lucide-react";
import { useGiftora } from "@/context/GiftoraContext";
import { useTheme } from "@/context/ThemeContext";

export function Navbar() {
  const pathname = usePathname();
  const { wishlist, compareList, user, logoutUser } = useGiftora();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8F5F0]/90 dark:bg-[#1E1620]/95 backdrop-blur-md border-b border-[#E6DDE5]/80 dark:border-[#36273B] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-xl bg-[#422C42] dark:bg-[#36273B] flex items-center justify-center text-[#E9DDE7] shadow-sm group-hover:bg-[#9B668B] transition-colors">
              <Sparkles className="w-5 h-5 text-[#E9DDE7]" />
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#422C42] dark:text-[#FAF6F8] leading-none">
                Giftora
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#9B668B] dark:text-[#C48EAE] font-semibold mt-0.5">
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
                  ? "text-[#422C42] dark:text-white font-semibold bg-[#E9DDE7]/60 dark:bg-[#36273B]"
                  : "text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white hover:bg-[#F2E8F0]/40 dark:hover:bg-[#271C2B]"
              }`}
            >
              <Compass className="w-4 h-4 text-[#9B668B] dark:text-[#C48EAE]" />
              Discover Gifts
            </Link>

            <Link
              href="/inspiration"
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
                pathname.startsWith("/inspiration")
                  ? "text-[#422C42] dark:text-white font-semibold bg-[#E9DDE7]/60 dark:bg-[#36273B]"
                  : "text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white hover:bg-[#F2E8F0]/40 dark:hover:bg-[#271C2B]"
              }`}
            >
              <Grid className="w-4 h-4 text-[#9B668B] dark:text-[#C48EAE]" />
              Inspiration Feed
            </Link>

            <Link
              href="/videos"
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
                pathname.startsWith("/videos")
                  ? "text-[#422C42] dark:text-white font-semibold bg-[#E9DDE7]/60 dark:bg-[#36273B]"
                  : "text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white hover:bg-[#F2E8F0]/40 dark:hover:bg-[#271C2B]"
              }`}
            >
              <Film className="w-4 h-4 text-[#9B668B] dark:text-[#C48EAE]" />
              Shorts
            </Link>

            <Link
              href="/recipients"
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
                pathname.startsWith("/recipients")
                  ? "text-[#422C42] dark:text-white font-semibold bg-[#E9DDE7]/60 dark:bg-[#36273B]"
                  : "text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white hover:bg-[#F2E8F0]/40 dark:hover:bg-[#271C2B]"
              }`}
            >
              <User className="w-4 h-4 text-[#9B668B] dark:text-[#C48EAE]" />
              Gifting Circle
            </Link>

            <Link
              href="/#occasions"
              className="text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white py-1 px-2.5 rounded-lg hover:bg-[#F2E8F0]/40 dark:hover:bg-[#271C2B] transition-colors"
            >
              Occasions
            </Link>
          </nav>
        </div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Theme Switcher Toggle */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              title="Switch Appearance Theme"
              className="p-2.5 rounded-xl border border-[#E6DDE5] dark:border-[#36273B] bg-white/80 dark:bg-[#271C2B] text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white hover:border-[#9B668B]/40 transition-all"
              aria-label="Theme options"
            >
              {mounted ? (
                resolvedTheme === "dark" ? (
                  <Moon className="w-4 h-4 text-[#C48EAE]" />
                ) : (
                  <Sun className="w-4 h-4 text-[#D4A373]" />
                )
              ) : (
                <Sun className="w-4 h-4 text-[#D4A373]" />
              )}
            </button>

            {themeDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#271C2B] rounded-2xl shadow-elevated border border-[#E6DDE5] dark:border-[#36273B] p-1.5 z-50 animate-in fade-in"
                onClick={() => setThemeDropdownOpen(false)}
              >
                <button
                  onClick={() => setTheme("light")}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    theme === "light"
                      ? "bg-[#E9DDE7]/70 dark:bg-[#36273B] text-[#422C42] dark:text-white font-semibold"
                      : "text-[#6E6770] dark:text-[#C4B5C3] hover:bg-[#F8F5F0] dark:hover:bg-[#36273B]/50"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-[#D4A373]" />
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    theme === "dark"
                      ? "bg-[#E9DDE7]/70 dark:bg-[#36273B] text-[#422C42] dark:text-white font-semibold"
                      : "text-[#6E6770] dark:text-[#C4B5C3] hover:bg-[#F8F5F0] dark:hover:bg-[#36273B]/50"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-[#C48EAE]" />
                  Dark
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    theme === "system"
                      ? "bg-[#E9DDE7]/70 dark:bg-[#36273B] text-[#422C42] dark:text-white font-semibold"
                      : "text-[#6E6770] dark:text-[#C4B5C3] hover:bg-[#F8F5F0] dark:hover:bg-[#36273B]/50"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 text-[#9B668B]" />
                  System
                </button>
              </div>
            )}
          </div>

          {/* Compare Link */}
          <Link
            href="/compare"
            title="Compare Gifts"
            className={`relative p-2.5 rounded-xl border transition-all ${
              mounted && compareList.length > 0
                ? "bg-[#E9DDE7]/70 dark:bg-[#36273B] border-[#9B668B]/40 text-[#422C42] dark:text-white"
                : "bg-white/80 dark:bg-[#271C2B] border-[#E6DDE5] dark:border-[#36273B] text-[#6E6770] dark:text-[#C4B5C3] hover:border-[#9B668B]/40 hover:text-[#422C42] dark:hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            {mounted && compareList.length > 0 && (
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
              mounted && wishlist.length > 0
                ? "bg-white dark:bg-[#271C2B] border-[#E6DDE5] dark:border-[#36273B] text-[#9B668B] dark:text-[#C48EAE]"
                : "bg-white/80 dark:bg-[#271C2B] border-[#E6DDE5] dark:border-[#36273B] text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#9B668B] dark:hover:text-[#C48EAE]"
            }`}
          >
            <Heart className={`w-4 h-4 ${mounted && wishlist.length > 0 ? "fill-[#9B668B] text-[#9B668B] dark:fill-[#C48EAE] dark:text-[#C48EAE]" : ""}`} />
            {mounted && wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#422C42] dark:bg-[#36273B] text-[#E9DDE7] text-[11px] font-bold flex items-center justify-center shadow-sm">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* User Auth / Profile */}
          {mounted && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-xl bg-white dark:bg-[#271C2B] border border-[#E6DDE5] dark:border-[#36273B] hover:border-[#9B668B]/50 transition-colors"
              >
                <span className="text-xs font-medium text-[#422C42] dark:text-[#FAF6F8] hidden sm:inline max-w-[100px] truncate">
                  {user.name}
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#E9DDE7] dark:bg-[#36273B] text-[#422C42] dark:text-[#FAF6F8] font-semibold text-xs flex items-center justify-center overflow-hidden">
                  {user.name.charAt(0)}
                </div>
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#271C2B] rounded-2xl shadow-elevated border border-[#E6DDE5] dark:border-[#36273B] p-2 z-50 animate-in fade-in"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#E6DDE5] dark:border-[#36273B] mb-1">
                    <p className="text-sm font-semibold text-[#422C42] dark:text-white">{user.name}</p>
                    <p className="text-xs text-[#6E6770] dark:text-[#C4B5C3] truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/recipients"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#422C42] dark:text-[#FAF6F8] hover:bg-[#F8F5F0] dark:hover:bg-[#36273B] rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 text-[#9B668B]" />
                    Gifting Circle ({wishlist.length} saved)
                  </Link>
                  <Link
                    href="/inspiration"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#422C42] dark:text-[#FAF6F8] hover:bg-[#F8F5F0] dark:hover:bg-[#36273B] rounded-lg transition-colors"
                  >
                    <Grid className="w-4 h-4 text-[#9B668B]" />
                    My Boards & Inspiration
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#422C42] dark:text-[#FAF6F8] hover:bg-[#F8F5F0] dark:hover:bg-[#36273B] rounded-lg transition-colors"
                  >
                    <Heart className="w-4 h-4 text-[#9B668B]" />
                    Saved Wishlist ({wishlist.length})
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#422C42] dark:text-[#FAF6F8] hover:bg-[#F8F5F0] dark:hover:bg-[#36273B] rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#9B668B]" />
                    Account & Preferences
                  </Link>
                  <button
                    onClick={() => logoutUser()}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-left border-t border-[#E6DDE5] dark:border-[#36273B] mt-1 pt-2"
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
              className="text-xs font-semibold text-[#422C42] dark:text-[#FAF6F8] hover:text-[#9B668B] px-3 py-2 rounded-lg transition-colors hidden sm:inline"
            >
              Sign In
            </Link>
          )}

          {/* Primary Action Button */}
          <Link
            href="/discover"
            className="hidden sm:inline-flex items-center gap-2 bg-[#422C42] hover:bg-[#9B668B] dark:bg-[#36273B] dark:hover:bg-[#9B668B] text-[#FAF8F5] text-xs font-semibold px-4 py-2.5 rounded-xl shadow-soft transition-all duration-200 active:scale-95"
          >
            <span>Find a Gift</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-white dark:bg-[#271C2B] border border-[#E6DDE5] dark:border-[#36273B] text-[#422C42] dark:text-white md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F8F5F0] dark:bg-[#1E1620] border-b border-[#E6DDE5] dark:border-[#36273B] px-5 py-6 space-y-4 shadow-elevated animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2 text-base font-medium">
            <Link
              href="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#E9DDE7]/60 dark:bg-[#271C2B] text-[#422C42] dark:text-white font-semibold"
            >
              <Compass className="w-5 h-5 text-[#9B668B]" />
              AI Gift Assistant
            </Link>
            <Link
              href="/inspiration"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white"
            >
              <Grid className="w-5 h-5 text-[#9B668B]" />
              Inspiration Feed & Boards
            </Link>
            <Link
              href="/videos"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white"
            >
              <Film className="w-5 h-5 text-[#9B668B]" />
              Gift Shorts
            </Link>
            <Link
              href="/recipients"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white"
            >
              <User className="w-5 h-5 text-[#9B668B]" />
              Gifting Circle
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white"
            >
              <Heart className="w-5 h-5 text-[#9B668B]" />
              Wishlist ({mounted ? wishlist.length : 0})
            </Link>
            <Link
              href="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white"
            >
              <Layers className="w-5 h-5 text-[#9B668B]" />
              Comparison ({mounted ? compareList.length : 0})
            </Link>
          </nav>

          <div className="pt-4 border-t border-[#E6DDE5] dark:border-[#36273B] flex flex-col gap-2.5">
            {mounted && user ? (
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-[#422C42] dark:text-white">{user.name}</p>
                  <p className="text-xs text-[#6E6770] dark:text-[#C4B5C3]">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-700 dark:text-rose-400 font-semibold px-3 py-1.5 border border-rose-200 dark:border-rose-900 rounded-lg bg-rose-50 dark:bg-rose-950/40"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 rounded-xl border border-[#E6DDE5] dark:border-[#36273B] text-sm font-semibold text-[#422C42] dark:text-white bg-white dark:bg-[#271C2B]"
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
              className="w-full text-center py-3 rounded-xl bg-[#422C42] dark:bg-[#36273B] text-white font-medium text-sm shadow-soft flex items-center justify-center gap-2"
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
