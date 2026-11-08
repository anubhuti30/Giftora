"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Heart, 
  ArrowLeft, 
  Sparkles, 
  Filter
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ProductCard } from "@/components/products/ProductCard";
import { CompareFloatingBar } from "@/components/products/CompareFloatingBar";
import { useGiftora } from "@/context/GiftoraContext";
import { formatPriceINR } from "@/lib/utils";

export default function WishlistPage() {
  const { wishlist } = useGiftora();
  const [selectedSort, setSelectedSort] = useState<string>("recent");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const totalValue = useMemo(() => {
    return wishlist.reduce((acc, item) => acc + item.price, 0);
  }, [wishlist]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    wishlist.forEach((w) => set.add(w.category));
    return ["all", ...Array.from(set)];
  }, [wishlist]);

  const sortedWishlist = useMemo(() => {
    return [...wishlist]
      .filter((item) => selectedCategory === "all" || item.category === selectedCategory)
      .sort((a, b) => {
        if (selectedSort === "price-asc") return a.price - b.price;
        if (selectedSort === "price-desc") return b.price - a.price;
        if (selectedSort === "match") return b.matchScore - a.matchScore;
        return 0; // recent
      });
  }, [wishlist, selectedCategory, selectedSort]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5F0]">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        <AppSidebar />

        <main className="flex-1 flex flex-col min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
          
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#8E8691] mb-2">
                <Link href="/discover" className="hover:text-[#422C42] flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Discovery Workspace</span>
                </Link>
                <span>/</span>
                <span className="text-[#422C42] font-semibold">Saved Wishlist</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#422C42]">
                Your Saved Gift Ideas
              </h1>
              <p className="text-xs sm:text-sm text-[#6E6770] mt-1">
                Keep track of items you love, organize by recipient, and plan upcoming celebrations.
              </p>
            </div>

            {/* Total Value Pill */}
            {wishlist.length > 0 && (
              <div className="bg-white px-5 py-3 rounded-2xl border border-[#E6DDE5] shadow-soft flex items-center gap-4 self-start md:self-auto">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8691] block">
                    Total Estimated Value
                  </span>
                  <span className="text-lg font-bold text-[#422C42]">
                    {formatPriceINR(totalValue)}
                  </span>
                </div>
                <div className="h-8 w-px bg-[#E6DDE5]" />
                <span className="text-xs font-semibold text-[#9B668B] bg-[#F2E8F0] px-3 py-1 rounded-full">
                  {wishlist.length} {wishlist.length === 1 ? "Gift" : "Gifts"}
                </span>
              </div>
            )}
          </div>

          {/* Filtering and Sorting Bar */}
          {wishlist.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-[#E6DDE5] shadow-soft mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs text-[#8E8691] font-medium mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Category:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-[#422C42] text-white"
                        : "bg-[#FAF8F5] text-[#6E6770] hover:bg-[#E9DDE7]/40"
                    }`}
                  >
                    {cat === "all" ? "All Categories" : cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-[#8E8691]">Sort:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  aria-label="Sort wishlist items"
                  className="bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3 py-1.5 text-xs text-[#422C42] font-semibold focus:outline-none focus:border-[#9B668B]"
                >
                  <option value="recent">Recently Added</option>
                  <option value="match">Highest AI Match</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          )}

          {/* Wishlist Grid */}
          {sortedWishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedWishlist.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white p-12 rounded-3xl border border-[#E6DDE5] text-center max-w-lg mx-auto my-12 space-y-4 shadow-soft">
              <div className="w-14 h-14 rounded-2xl bg-[#E9DDE7] text-[#422C42] flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-[#9B668B]" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#422C42]">
                Your wishlist is currently empty
              </h2>
              <p className="text-xs sm:text-sm text-[#6E6770] leading-relaxed">
                As you explore gifts recommended by our AI assistant or browse curated collections, tap the heart icon on any card to save it here.
              </p>
              <div className="pt-4">
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#422C42] text-white text-xs font-semibold hover:bg-[#9B668B] transition-colors shadow-soft"
                >
                  <Sparkles className="w-4 h-4 text-[#E9DDE7]" />
                  <span>Start Exploring Gifts</span>
                </Link>
              </div>
            </div>
          )}

        </main>
      </div>

      <CompareFloatingBar />
    </div>
  );
}
