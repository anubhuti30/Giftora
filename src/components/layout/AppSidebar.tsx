"use client";

import React from "react";
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
  ChevronRight
} from "lucide-react";
import { useGiftora } from "@/context/GiftoraContext";

export function AppSidebar() {
  const pathname = usePathname();
  const { wishlist, compareList, recipients, user, updateSearchCriteria } = useGiftora();

  const recentSearches = [
    { 
      title: "Sister's 28th Birthday", 
      context: "Pooja • ₹500–₹2,500 • Aromatherapy", 
      recipientName: "Pooja",
      relationship: "Sister",
      occasion: "Birthday",
      interests: ["Aromatherapy & Candles", "Specialty Coffee", "Ceramics & Pottery"],
      budgetRange: { min: 500, max: 2500 },
    },
    { 
      title: "Best Friend Desk Setup", 
      context: "Arjun • ₹2,500–₹5,000 • Tech & Coffee", 
      recipientName: "Arjun",
      relationship: "Best Friend",
      occasion: "Birthday",
      interests: ["Minimalist Tech", "Specialty Coffee"],
      budgetRange: { min: 2500, max: 5000 },
    },
    { 
      title: "Mom's Festival Saree & Ayurveda", 
      context: "Mom • ₹5,000+ • Handloom & Saffron", 
      recipientName: "Meera (Mom)",
      relationship: "Mom",
      occasion: "Festivals",
      interests: ["Luxury Ayurvedic Skincare", "Artisanal Sweets & Dark Chocolate"],
      budgetRange: { min: 5000, max: 50000 },
    },
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-[#FAF8F5] border-r border-[#E6DDE5] flex flex-col justify-between min-h-[calc(100vh-80px)] p-4 sm:p-5">
      <div className="space-y-6">
        
        {/* New Search Action */}
        <div>
          <Link
            href="/discover"
            className="w-full flex items-center justify-center gap-2.5 bg-[#422C42] hover:bg-[#9B668B] text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-soft transition-all duration-200 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#E9DDE7]" />
            <span>New Gift Discovery</span>
          </Link>
        </div>

        {/* Primary Workspace Navigation */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#8E8691] px-3 mb-2">
            Discovery Workspace
          </p>

          <Link
            href="/discover"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/discover"
                ? "bg-[#E9DDE7] text-[#422C42] shadow-xs"
                : "text-[#6E6770] hover:text-[#422C42] hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-[#9B668B]" />
              <span>AI Assistant</span>
            </div>
            {pathname === "/discover" && <span className="w-1.5 h-1.5 rounded-full bg-[#9B668B]" />}
          </Link>

          <Link
            href="/discover/results"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/discover/results"
                ? "bg-[#E9DDE7] text-[#422C42] shadow-xs"
                : "text-[#6E6770] hover:text-[#422C42] hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#9B668B]" />
              <span>Curated Results</span>
            </div>
          </Link>

          <Link
            href="/compare"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/compare"
                ? "bg-[#E9DDE7] text-[#422C42] shadow-xs"
                : "text-[#6E6770] hover:text-[#422C42] hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-[#9B668B]" />
              <span>Compare Gifts</span>
            </div>
            {compareList.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#422C42] text-[#FAF8F5]">
                {compareList.length}
              </span>
            )}
          </Link>

          <Link
            href="/wishlist"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/wishlist"
                ? "bg-[#E9DDE7] text-[#422C42] shadow-xs"
                : "text-[#6E6770] hover:text-[#422C42] hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-[#9B668B]" />
              <span>Saved Wishlist</span>
            </div>
            {wishlist.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#9B668B] text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link
            href="/recipients"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/recipients"
                ? "bg-[#E9DDE7] text-[#422C42] shadow-xs"
                : "text-[#6E6770] hover:text-[#422C42] hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#9B668B]" />
              <span>Recipient Profiles</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#E6DDE5] text-[#6E6770]">
              {recipients.length}
            </span>
          </Link>
        </div>

        {/* Saved Recipient Quick Access */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8691]">
              Loved Ones
            </span>
            <Link
              href="/recipients"
              className="text-[10px] font-bold text-[#9B668B] hover:text-[#422C42]"
            >
              Manage
            </Link>
          </div>
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
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-white transition-colors group"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded-full bg-[#E9DDE7] text-[#422C42] font-semibold text-[10px] flex items-center justify-center shrink-0">
                    {recipient.name.charAt(0)}
                  </div>
                  <span className="font-medium text-[#29252A] group-hover:text-[#422C42] truncate">
                    {recipient.name}
                  </span>
                  <span className="text-[10px] text-[#8E8691]">
                    ({recipient.relationship})
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#8E8691] group-hover:text-[#9B668B] transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        <div className="pt-2">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#8E8691] px-3 mb-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#9B668B]" />
            Recent Searches
          </p>
          <div className="space-y-1">
            {recentSearches.map((item, idx) => (
              <Link
                key={idx}
                href="/discover/results"
                onClick={() => {
                  updateSearchCriteria({
                    recipientName: item.recipientName,
                    relationship: item.relationship,
                    occasion: item.occasion,
                    interests: item.interests,
                    budgetRange: item.budgetRange,
                    query: `Gifts for ${item.recipientName}`,
                  });
                }}
                className="block px-3 py-2 rounded-xl hover:bg-white transition-colors text-left"
              >
                <p className="text-xs font-medium text-[#29252A] truncate">
                  {item.title}
                </p>
                <p className="text-[10px] text-[#8E8691] truncate">
                  {item.context}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* User Area & Settings Footer */}
      <div className="pt-6 border-t border-[#E6DDE5] mt-6">
        <Link
          href="/settings"
          className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
            pathname === "/settings"
              ? "bg-[#E9DDE7] text-[#422C42]"
              : "hover:bg-white text-[#6E6770] hover:text-[#422C42]"
          }`}
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-[#422C42] text-[#FAF8F5] font-semibold text-xs flex items-center justify-center shrink-0">
              {user ? user.name.charAt(0) : "G"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-[#29252A] truncate">
                {user ? user.name : "Guest User"}
              </p>
              <p className="text-[10px] text-[#8E8691] truncate">
                {user ? user.email : "Sign in to save"}
              </p>
            </div>
          </div>
          <Settings className="w-4 h-4 text-[#8E8691]" />
        </Link>
      </div>
    </aside>
  );
}
