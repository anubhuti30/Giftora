"use client";

import React from "react";
import Link from "next/link";
import { 
  Layers, 
  ArrowLeft, 
  X, 
  ExternalLink, 
  Sparkles, 
  Check, 
  Trash2, 
  Heart
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useGiftora } from "@/context/GiftoraContext";
import { MOCK_PRODUCTS } from "@/data/mockProducts";
import { formatPriceINR } from "@/lib/utils";
import { SafeImage } from "@/components/ui/SafeImage";
import { Product } from "@/types";

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare, toggleWishlist, isInWishlist, toggleCompare } = useGiftora();

  const getResolvedUrl = (p: Product) => {
    if (p.productUrl && !p.productUrl.includes("/sample/")) {
      return p.productUrl;
    }
    const query = encodeURIComponent(p.title);
    if (p.source === "Amazon India") return `https://www.amazon.in/s?k=${query}`;
    if (p.source === "Etsy") return `https://www.etsy.com/in-en/search?q=${query}`;
    if (p.source === "Tata CLiQ Luxury") return `https://luxury.tatacliq.com/search/?searchCategory=all&text=${query}`;
    if (p.source === "Fabindia") return `https://www.fabindia.com/search?q=${query}`;
    if (p.source === "Nicobar") return `https://www.nicobar.com/search?q=${query}`;
    if (p.source === "Forest Essentials") return `https://www.forestessentialsindia.com/catalogsearch/result/?q=${query}`;
    return `https://www.google.com/search?q=${encodeURIComponent(`${p.title} ${p.source}`)}`;
  };

  // If user has 0 items in compare, allow one-click quick comparison loading
  const handleLoadSampleCompare = () => {
    // Add Fig Candle and Silk Sleep Set for immediate side-by-side demonstration
    if (!compareList.some(p => p.id === MOCK_PRODUCTS[0].id)) toggleCompare(MOCK_PRODUCTS[0]);
    if (!compareList.some(p => p.id === MOCK_PRODUCTS[3].id)) toggleCompare(MOCK_PRODUCTS[3]);
    if (!compareList.some(p => p.id === MOCK_PRODUCTS[6].id)) toggleCompare(MOCK_PRODUCTS[6]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5F0]">
      <Navbar />

      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col lg:flex-row">
        <AppSidebar />

        <main className="flex-1 flex flex-col min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
          
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#8E8691] mb-2">
                <Link href="/discover/results" className="hover:text-[#422C42] flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Discovery</span>
                </Link>
                <span>/</span>
                <span className="text-[#422C42] font-semibold">Side-by-Side Comparison</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#422C42]">
                Compare Gift Candidates
              </h1>
              <p className="text-xs sm:text-sm text-[#6E6770] mt-1">
                Evaluate materials, emotional compatibility, marketplace transparency, and overall value.
              </p>
            </div>

            {compareList.length > 0 && (
              <button
                onClick={() => clearCompare()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl transition-colors self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All ({compareList.length})</span>
              </button>
            )}
          </div>

          {compareList.length === 0 ? (
            /* Empty State */
            <div className="bg-white p-12 rounded-3xl border border-[#E6DDE5] text-center max-w-lg mx-auto my-12 space-y-4 shadow-soft">
              <div className="w-14 h-14 rounded-2xl bg-[#E9DDE7] text-[#422C42] flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6 text-[#9B668B]" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#422C42]">
                No gifts selected for comparison yet
              </h2>
              <p className="text-xs sm:text-sm text-[#6E6770] leading-relaxed">
                Add up to 4 gifts from your discovery results or curated collections to compare features, prices, and match scores side-by-side.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleLoadSampleCompare}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#422C42] text-white text-xs font-semibold hover:bg-[#9B668B] transition-colors shadow-soft"
                >
                  <Sparkles className="w-4 h-4 text-[#E9DDE7]" />
                  <span>Load Sample Comparison</span>
                </button>
                <Link
                  href="/discover/results"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#E6DDE5] text-[#422C42] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors"
                >
                  <span>Browse Results</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Side-by-Side Comparison Matrix */
            <div className="bg-white rounded-3xl border border-[#E6DDE5] shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E6DDE5] bg-[#FAF8F5]">
                      <th className="p-4 sm:p-6 w-48 sm:w-64 min-w-[180px] text-xs font-bold uppercase tracking-wider text-[#8E8691] align-top">
                        Product Details
                      </th>
                      {compareList.map((product) => (
                        <th key={product.id} className="p-4 sm:p-6 min-w-[260px] max-w-[320px] align-top relative">
                          <button
                            onClick={() => removeFromCompare(product.id)}
                            className="absolute top-4 right-4 text-[#8E8691] hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Remove from comparison"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Image */}
                          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-[#E6DDE5] mb-3">
                            <SafeImage
                              src={product.imageUrl}
                              alt={product.title}
                              fill
                              className="object-cover"
                              fallbackSrc="/images/hero/luxury_gift_hero.jpg"
                            />
                            <button
                              onClick={() => toggleWishlist(product)}
                              className="absolute top-2 left-2 p-1.5 rounded-full bg-white/90 shadow-sm"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  isInWishlist(product.id) ? "fill-[#9B668B] text-[#9B668B]" : "text-[#422C42]"
                                }`}
                              />
                            </button>
                          </div>

                          <span className="text-[10px] font-bold uppercase tracking-wide text-[#9B668B] bg-[#F2E8F0] px-2 py-0.5 rounded-md">
                            {product.source}
                          </span>

                          <h3 className="font-serif text-sm sm:text-base font-bold text-[#422C42] mt-1.5 line-clamp-2">
                            {product.title}
                          </h3>

                          <div className="mt-2 text-lg font-bold text-[#422C42]">
                            {formatPriceINR(product.price)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E6DDE5] text-xs">
                    {/* Row: AI Match Score */}
                    <tr>
                      <td className="p-4 sm:p-6 font-semibold text-[#422C42] bg-[#FAF8F5]/50">
                        AI Compatibility
                      </td>
                      {compareList.map((product) => (
                        <td key={product.id} className="p-4 sm:p-6 space-y-1.5">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E9DDE7] text-[#422C42] text-xs font-semibold">
                            <Sparkles className="w-3.5 h-3.5 text-[#9B668B]" />
                            <span>{product.matchScore}% Compatibility</span>
                          </div>
                          <p className="text-[#6E6770] leading-relaxed text-[11px]">
                            {product.aiMatchReason}
                          </p>
                        </td>
                      ))}
                    </tr>

                    {/* Row: Ideal Recipient Alignment */}
                    <tr>
                      <td className="p-4 sm:p-6 font-semibold text-[#422C42] bg-[#FAF8F5]/50">
                        Ideal For
                      </td>
                      {compareList.map((product) => (
                        <td key={product.id} className="p-4 sm:p-6 text-[#29252A] font-medium leading-relaxed">
                          {product.valueComparison.idealFor}
                        </td>
                      ))}
                    </tr>

                    {/* Row: Material & Craftsmanship */}
                    <tr>
                      <td className="p-4 sm:p-6 font-semibold text-[#422C42] bg-[#FAF8F5]/50">
                        Material & Craft
                      </td>
                      {compareList.map((product) => (
                        <td key={product.id} className="p-4 sm:p-6 text-[#29252A]">
                          <span className="font-semibold text-[#422C42] block mb-1">
                            {product.valueComparison.material || "Handcrafted composite"}
                          </span>
                          <ul className="space-y-1 text-[#6E6770]">
                            {product.features.slice(0, 3).map((feat, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#9B668B]" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>

                    {/* Row: Value Comparison & Pros */}
                    <tr>
                      <td className="p-4 sm:p-6 font-semibold text-[#422C42] bg-[#FAF8F5]/50">
                        Distinct Advantages
                      </td>
                      {compareList.map((product) => (
                        <td key={product.id} className="p-4 sm:p-6">
                          <ul className="space-y-1.5">
                            {product.valueComparison.pros.map((pro, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-[#29252A]">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>

                    {/* Row: Delivery & Customer Sentiment */}
                    <tr>
                      <td className="p-4 sm:p-6 font-semibold text-[#422C42] bg-[#FAF8F5]/50">
                        Delivery & Reviews
                      </td>
                      {compareList.map((product) => (
                        <td key={product.id} className="p-4 sm:p-6 space-y-1 text-[#6E6770]">
                          <p>
                            <strong className="text-[#422C42]">Speed:</strong> {product.valueComparison.deliveryEstimate}
                          </p>
                          <p className="text-[11px] text-[#9B668B] font-medium">
                            {product.valueComparison.sentimentRating}
                          </p>
                        </td>
                      ))}
                    </tr>

                    {/* Row: Actions */}
                    <tr>
                      <td className="p-4 sm:p-6 font-semibold text-[#422C42] bg-[#FAF8F5]/50">
                        Purchase Action
                      </td>
                      {compareList.map((product) => (
                        <td key={product.id} className="p-4 sm:p-6">
                          <a
                            href={getResolvedUrl(product)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#422C42] hover:bg-[#9B668B] text-white text-xs font-semibold shadow-soft transition-all active:scale-95"
                          >
                            <span>Shop on {product.source}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      ))}
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
