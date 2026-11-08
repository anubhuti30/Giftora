"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  Search, 
  Clock, 
  Users, 
  Heart, 
  Layers, 
  Settings, 
  ChevronRight,
  UserPlus,
  Grid,
  Film
} from "lucide-react";
import { useGiftora } from "@/context/GiftoraContext";

export function AppSidebar() {
  const pathname = usePathname();
  const { wishlist, compareList, recipients, user, updateSearchCriteria } = useGiftora();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-[#FAF8F5] dark:bg-[#1E1620] border-r border-[#E6DDE5] dark:border-[#36273B] flex flex-col justify-between min-h-[calc(100vh-80px)] p-4 sm:p-5 transition-colors">
      <div className="space-y-6">
        
        {/* New Search Action */}
        <div>
          <Link
            href="/discover"
            className="w-full flex items-center justify-center gap-2.5 bg-[#422C42] hover:bg-[#9B668B] dark:bg-[#36273B] dark:hover:bg-[#9B668B] text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-soft transition-all duration-200 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#E9DDE7]" />
            <span>New Gift Discovery</span>
          </Link>
        </div>

        {/* Primary Workspace Navigation */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#8E8691] dark:text-[#C4B5C3] px-3 mb-2">
            Discovery Workspace
          </p>

          <Link
            href="/discover"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/discover"
                ? "bg-[#E9DDE7] dark:bg-[#36273B] text-[#422C42] dark:text-white shadow-xs"
                : "text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white hover:bg-white dark:hover:bg-[#271C2B]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-[#9B668B] dark:text-[#C48EAE]" />
              <span>AI Concierge</span>
            </div>
            {pathname === "/discover" && <span className="w-1.5 h-1.5 rounded-full bg-[#9B668B]" />}
          </Link>

          <Link
            href="/inspiration"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/inspiration"
                ? "bg-[#E9DDE7] dark:bg-[#36273B] text-[#422C42] dark:text-white shadow-xs"
                : "text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white hover:bg-white dark:hover:bg-[#271C2B]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Grid className="w-4 h-4 text-[#9B668B] dark:text-[#C48EAE]" />
              <span>Inspiration Feed & Boards</span>
            </div>
            {pathname === "/inspiration" && <span className="w-1.5 h-1.5 rounded-full bg-[#9B668B]" />}
          </Link>

          <Link
            href="/videos"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/videos"
                ? "bg-[#E9DDE7] dark:bg-[#36273B] text-[#422C42] dark:text-white shadow-xs"
                : "text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white hover:bg-white dark:hover:bg-[#271C2B]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Film className="w-4 h-4 text-[#9B668B] dark:text-[#C48EAE]" />
              <span>Gift Shorts</span>
            </div>
            {pathname === "/videos" && <span className="w-1.5 h-1.5 rounded-full bg-[#9B668B]" />}
          </Link>

          <Link
            href="/compare"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/compare"
                ? "bg-[#E9DDE7] dark:bg-[#36273B] text-[#422C42] dark:text-white shadow-xs"
                : "text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white hover:bg-white dark:hover:bg-[#271C2B]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-[#9B668B] dark:text-[#C48EAE]" />
              <span>Compare Gifts</span>
            </div>
            {mounted && compareList.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#422C42] dark:bg-[#9B668B] text-[#FAF8F5]">
                {compareList.length}
              </span>
            )}
          </Link>

          <Link
            href="/wishlist"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/wishlist"
                ? "bg-[#E9DDE7] dark:bg-[#36273B] text-[#422C42] dark:text-white shadow-xs"
                : "text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white hover:bg-white dark:hover:bg-[#271C2B]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-[#9B668B] dark:text-[#C48EAE]" />
              <span>Saved Wishlist</span>
            </div>
            {mounted && wishlist.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#9B668B] text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link
            href="/recipients"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/recipients"
                ? "bg-[#E9DDE7] dark:bg-[#36273B] text-[#422C42] dark:text-white shadow-xs"
                : "text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white hover:bg-white dark:hover:bg-[#271C2B]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#9B668B] dark:text-[#C48EAE]" />
              <span>Gifting Circle</span>
            </div>
            {mounted && recipients.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#E6DDE5] dark:bg-[#36273B] text-[#6E6770] dark:text-[#C4B5C3]">
                {recipients.length}
              </span>
            )}
          </Link>
        </div>

        {/* Saved Recipient Quick Access / Empty state */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8691] dark:text-[#C4B5C3]">
              Gifting Circle
            </span>
            <Link
              href="/recipients"
              className="text-[10px] font-bold text-[#9B668B] hover:text-[#422C42] dark:hover:text-white"
            >
              {mounted && recipients.length > 0 ? "Manage" : "Add"}
            </Link>
          </div>
          
          {mounted && recipients.length > 0 ? (
            <div className="space-y-1">
              {recipients.slice(0, 3).map((recipient) => (
                <Link
                  key={recipient.id}
                  href={`/discover?recipient=${encodeURIComponent(recipient.name)}`}
                  onClick={() => {
                    updateSearchCriteria({
                      recipientName: recipient.name,
                      relationship: recipient.relationship,
                      interests: recipient.interests,
                    });
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-white dark:hover:bg-[#271C2B] transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-6 h-6 rounded-full bg-[#E9DDE7] dark:bg-[#36273B] text-[#422C42] dark:text-white font-semibold text-[10px] flex items-center justify-center shrink-0">
                      {recipient.name.charAt(0)}
                    </div>
                    <span className="font-medium text-[#29252A] dark:text-[#FAF6F8] group-hover:text-[#422C42] truncate">
                      {recipient.name}
                    </span>
                    <span className="text-[10px] text-[#8E8691] dark:text-[#9E8E9D]">
                      ({recipient.relationship})
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8E8691] group-hover:text-[#9B668B] transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white/60 dark:bg-[#271C2B]/60 border border-dashed border-[#E6DDE5] dark:border-[#36273B] text-center">
              <p className="text-[11px] text-[#6E6770] dark:text-[#C4B5C3] font-medium mb-2">
                Your gifting circle starts here.
              </p>
              <Link
                href="/recipients"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#9B668B] hover:text-[#422C42] dark:hover:text-white"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add someone special</span>
              </Link>
            </div>
          )}
        </div>

        {/* Discovery Guide Quick Link */}
        <div className="pt-2">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#8E8691] dark:text-[#C4B5C3] px-3 mb-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#9B668B]" />
            Quick Shortcuts
          </p>
          <div className="space-y-1">
            <Link
              href="/discover"
              className="block px-3 py-2 rounded-xl hover:bg-white dark:hover:bg-[#271C2B] transition-colors text-left"
            >
              <p className="text-xs font-medium text-[#29252A] dark:text-[#FAF6F8] truncate">
                Ask AI Concierge
              </p>
              <p className="text-[10px] text-[#8E8691] dark:text-[#9E8E9D] truncate">
                Find gifts with natural dialogue
              </p>
            </Link>
            <Link
              href="/inspiration"
              className="block px-3 py-2 rounded-xl hover:bg-white dark:hover:bg-[#271C2B] transition-colors text-left"
            >
              <p className="text-xs font-medium text-[#29252A] dark:text-[#FAF6F8] truncate">
                Trending Aesthetics
              </p>
              <p className="text-[10px] text-[#8E8691] dark:text-[#9E8E9D] truncate">
                Explore curated visual cards
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* User Area & Settings Footer */}
      <div className="pt-6 border-t border-[#E6DDE5] dark:border-[#36273B] mt-6">
        <Link
          href="/settings"
          className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
            pathname === "/settings"
              ? "bg-[#E9DDE7] dark:bg-[#36273B] text-[#422C42] dark:text-white"
              : "hover:bg-white dark:hover:bg-[#271C2B] text-[#6E6770] dark:text-[#C4B5C3] hover:text-[#422C42] dark:hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-[#422C42] text-[#FAF8F5] font-semibold text-xs flex items-center justify-center shrink-0">
              {mounted && user ? user.name.charAt(0) : "G"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-[#29252A] dark:text-[#FAF6F8] truncate">
                {mounted && user ? user.name : "Guest User"}
              </p>
              <p className="text-[10px] text-[#8E8691] dark:text-[#9E8E9D] truncate">
                {mounted && user ? user.email : "Sign in to save"}
              </p>
            </div>
          </div>
          <Settings className="w-4 h-4 text-[#8E8691]" />
        </Link>
      </div>
    </aside>
  );
}
