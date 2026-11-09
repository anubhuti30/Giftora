"use client";

import React, { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, 
  ArrowLeft, 
  SlidersHorizontal, 
  RotateCcw, 
  Search, 
  ShieldCheck,
  ExternalLink,
  Camera
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ProductCard } from "@/components/products/ProductCard";
import { CompareFloatingBar } from "@/components/products/CompareFloatingBar";
import { useGiftora } from "@/context/GiftoraContext";
import { formatPriceINR } from "@/lib/utils";
import { api } from "@/lib/api";
import { Product, InspirationItem, ExternalAiDestination } from "@/types";

type SearchRecommendation = {
  product_source_id: string;
  product_title: string;
  marketplace_name: string;
  price: number;
  original_price?: number | null;
  image_url: string;
  product_url?: string | null;
  retailer_search_url?: string;
  link_status?: "VERIFIED" | "INCONCLUSIVE" | "INVALID" | "SEARCH_FALLBACK";
  is_search_fallback?: boolean;
  rating?: number | null;
  source_rating?: number | null;
  review_count?: number | null;
  source_review_count?: number | null;
  relevance_score?: number;
  final_score?: number;
  match_explanation: string;
  category?: string;
};

function toProducts(items: SearchRecommendation[]): Product[] {
  return items.map((item): Product => ({
    id: item.product_source_id,
    title: item.product_title,
    price: item.price,
    originalPrice: item.original_price ?? undefined,
    currency: "INR",
    source: item.marketplace_name as Product["source"],
    category: item.category || "Gifts",
    rating: item.rating ?? item.source_rating ?? null,
    reviewCount: item.review_count ?? item.source_review_count ?? null,
    imageUrl: item.image_url,
    aiMatchReason: item.match_explanation,
    matchScore: item.relevance_score ?? item.final_score ?? 0,
    tags: [],
    occasions: [],
    features: [],
    productUrl: item.product_url,
    retailerSearchUrl: item.retailer_search_url,
    linkStatus: item.link_status || (item.is_search_fallback ? "SEARCH_FALLBACK" : "VERIFIED"),
    isSearchFallback: item.is_search_fallback ?? false,
    valueComparison: { pros: [], idealFor: "Based on your search", deliveryEstimate: "Not verified", sentimentRating: "Not available" },
  }));
}

function DiscoverResultsContent() {
  const { activeSearch } = useGiftora();
  const searchParams = useSearchParams();
  const [apiProducts, setApiProducts] = useState<Product[] | null>(null);
  const [visualInspirations, setVisualInspirations] = useState<InspirationItem[]>([]);
  const [externalAi, setExternalAi] = useState<ExternalAiDestination | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const searchId = searchParams.get("search_id");
    let active = true;

    if (searchId) {
      api.getSearchResults(searchId)
        .then((result) => {
          if (!active) return;
          setApiProducts(toProducts(result.recommendations));
          if (result.visual_inspirations && result.visual_inspirations.length > 0) {
            setVisualInspirations(result.visual_inspirations);
          }
          if (result.external_ai_destination) {
            setExternalAi(result.external_ai_destination);
          }
        })
        .catch(() => {
          try {
            const cached = sessionStorage.getItem(`giftora_search_${searchId}`);
            const cachedVisual = sessionStorage.getItem(`giftora_visual_${searchId}`);
            const cachedAi = sessionStorage.getItem(`giftora_ai_dest_${searchId}`);
            if (active && cached) {
              setApiProducts(toProducts(JSON.parse(cached) as SearchRecommendation[]));
              if (cachedVisual) {
                setVisualInspirations(JSON.parse(cachedVisual));
              }
              if (cachedAi) {
                setExternalAi(JSON.parse(cachedAi));
              }
              setLoadError("Showing this browser session's search results; the saved server copy is unavailable.");
              return;
            }
          } catch {}
          if (active) {
            setApiProducts([]);
            setLoadError("Saved search results could not be loaded. Please return to discovery and try again.");
          }
        });
    } else {
      // Graceful fallback when navigating without ?search_id=:
      // 1. Check if sessionStorage has a recent search
      try {
        const lastSearchId = sessionStorage.getItem("giftora_last_search_id");
        if (lastSearchId) {
          const cached = sessionStorage.getItem(`giftora_search_${lastSearchId}`);
          if (cached) {
            const parsed = JSON.parse(cached) as SearchRecommendation[];
            if (parsed.length > 0) {
              setApiProducts(toProducts(parsed));
              const cachedVisual = sessionStorage.getItem(`giftora_visual_${lastSearchId}`);
              if (cachedVisual) setVisualInspirations(JSON.parse(cachedVisual));
              const cachedAi = sessionStorage.getItem(`giftora_ai_dest_${lastSearchId}`);
              if (cachedAi) setExternalAi(JSON.parse(cachedAi));
              return;
            }
          }
        }
      } catch {}

      // 2. Otherwise execute live search using activeSearch parameters
      const reqInterests = (activeSearch.interests && activeSearch.interests.length > 0)
        ? activeSearch.interests
        : [];
      const reqMaxBudget = activeSearch.budgetRange?.max || 50000;
      const reqMinBudget = activeSearch.budgetRange?.min || 0;
      const reqQuery = activeSearch.query || `Gifts for ${activeSearch.recipientName || "Loved One"}`;

      api.searchGifts({
        recipient_name: activeSearch.recipientName || "Loved One",
        relationship: activeSearch.relationship || "Loved One",
        occasion: activeSearch.occasion || "Celebration",
        interests: reqInterests,
        minimum_budget: reqMinBudget,
        maximum_budget: reqMaxBudget,
        query: reqQuery
      }).then((result) => {
        if (!active) return;
        setApiProducts(toProducts(result.recommendations as SearchRecommendation[]));
        if (result.visual_inspirations && result.visual_inspirations.length > 0) {
          setVisualInspirations(result.visual_inspirations);
        }
        if (result.external_ai_destination) {
          setExternalAi(result.external_ai_destination);
        }
      }).catch(() => {
        if (active) setApiProducts([]);
      });
    }

    return () => { active = false; };
  }, [searchParams, activeSearch]);

  // Filters & Sorting state
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("match");
  const [maxPrice, setMaxPrice] = useState<number>(activeSearch.budgetRange.max || 50000);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (activeSearch.budgetRange?.max && activeSearch.budgetRange.max > 0) {
      setMaxPrice(activeSearch.budgetRange.max);
    }
  }, [activeSearch.budgetRange?.max]);

  // Dynamically compute available sources from returned shopping products only (excluding Pinterest)
  const sources = useMemo(() => {
    if (!apiProducts || apiProducts.length === 0) {
      return ["all", "Amazon", "Flipkart", "Myntra"];
    }
    const unique = Array.from(
      new Set(
        apiProducts
          .map((p) => p.source)
          .filter((s) => s && s.toLowerCase() !== "pinterest")
      )
    );
    return ["all", ...unique];
  }, [apiProducts]);

  // Dynamically compute available categories from returned products
  const categories = useMemo(() => {
    if (!apiProducts || apiProducts.length === 0) {
      return ["all", "Home & Living", "Kitchen & Dining", "Wellness & Sleep", "Fashion & Lifestyle", "Technology"];
    }
    const unique = Array.from(new Set(apiProducts.map((p) => p.category).filter(Boolean)));
    return ["all", ...unique];
  }, [apiProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const products = apiProducts ?? [];
    return products.filter((product) => {
      // Marketplace filter
      if (selectedSource !== "all" && product.source !== selectedSource) {
        return false;
      }
      // Category filter
      if (filterCategory !== "all" && product.category !== filterCategory) {
        return false;
      }
      // Price ceiling filter
      if (product.price > maxPrice) {
        return false;
      }
      // Search term query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesTags = product.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = product.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTags && !matchesCategory) return false;
      }
      return true;
    }).sort((a, b) => {
      if (selectedSort === "match") return b.matchScore - a.matchScore;
      if (selectedSort === "price-asc") return a.price - b.price;
      if (selectedSort === "price-desc") return b.price - a.price;
      if (selectedSort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      return 0;
    });
  }, [apiProducts, selectedSource, filterCategory, maxPrice, searchQuery, selectedSort]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5F0]">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        {/* Workspace Sidebar */}
        <AppSidebar />

        {/* Results Main Area */}
        <main className="flex-1 flex flex-col min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
          
          {/* Breadcrumb & Context Header */}
          <div className="mb-6 space-y-3">
            {loadError && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{loadError}</p>}
            <div className="flex items-center gap-2 text-xs text-[#8E8691]">
              <Link href="/discover" className="hover:text-[#422C42] flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Assistant</span>
              </Link>
              <span>/</span>
              <span className="text-[#422C42] font-semibold">Discovery Results</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9DDE7] text-[#422C42] text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#9B668B]" />
                  Personalized AI Match Set
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#422C42]">
                  Curated Gifts for {activeSearch.recipientName || "Loved One"}
                </h1>
                <p className="text-xs sm:text-sm text-[#6E6770] mt-1">
                  Context: <strong>{activeSearch.relationship}</strong> • {activeSearch.occasion} • Passions: {activeSearch.interests.join(", ")}
                </p>
              </div>

              {/* Edit Criteria button */}
              <Link
                href="/discover"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9B668B] hover:text-[#422C42] bg-white px-3.5 py-2 rounded-xl border border-[#E6DDE5] shadow-xs shrink-0 self-start md:self-auto"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Refine AI Criteria</span>
              </Link>
            </div>
          </div>

          {/* Transparent Illustrative Catalog Notice */}
          <div className="mb-6 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E6DDE5] flex items-center justify-between gap-3 text-xs text-[#6E6770]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9B668B] shrink-0" />
              <span>
                <strong>Illustrative Catalog:</strong> Real curated photography and verified pricing models. Outbound links connect to official marketplace product destinations.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#422C42] shrink-0 hidden sm:inline">
              Verified Retailers
            </span>
          </div>

          {/* Sticky Filter & Sort Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E6DDE5] shadow-soft mb-8 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Search Inside Results */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8691]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by keyword (e.g. coffee, candle, brass, silk)..."
                  className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl pl-10 pr-4 py-2 text-xs text-[#29252A] placeholder-[#8E8691] focus:outline-none focus:border-[#9B668B]"
                />
              </div>

              {/* Sort Selector & Counts */}
              <div className="flex items-center gap-3 justify-between md:justify-end">
                <span className="text-xs text-[#6E6770] whitespace-nowrap">
                  Showing <strong>{filteredProducts.length}</strong> gifts
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8E8691] hidden sm:inline">Sort by:</span>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    aria-label="Sort gifts by"
                    className="bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3 py-2 text-xs text-[#422C42] font-semibold focus:outline-none focus:border-[#9B668B]"
                  >
                    <option value="match">Highest AI Match</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Customer Rating</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Quick Filters Row (Marketplace sources + Max Price) */}
            <div className="flex items-center gap-4 flex-wrap pt-2 border-t border-[#E6DDE5] text-xs">
              
              {/* Category Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#8E8691] font-medium">Category:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  aria-label="Filter by category"
                  className="bg-[#FAF8F5] border border-[#E6DDE5] rounded-lg px-2.5 py-1 text-xs text-[#422C42] font-medium focus:outline-none focus:border-[#9B668B]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "All Categories" : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Marketplace Source Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[#8E8691] font-medium mr-1">Source:</span>
                {sources.map((src) => (
                  <button
                    key={src}
                    onClick={() => setSelectedSource(src)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      selectedSource === src
                        ? "bg-[#422C42] text-white"
                        : "bg-[#FAF8F5] text-[#6E6770] hover:bg-[#E9DDE7]/40"
                    }`}
                  >
                    {src === "all" ? "All Sources" : src}
                  </button>
                ))}
              </div>

              {/* Price Ceiling */}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[#8E8691] font-medium">Max Price:</span>
                <input
                  type="range"
                  min="500"
                  max="25000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-24 sm:w-32 accent-[#9B668B]"
                />
                <span className="font-semibold text-[#422C42] w-16 text-right">
                  {formatPriceINR(maxPrice)}
                </span>
              </div>

            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white p-12 rounded-3xl border border-[#E6DDE5] text-center max-w-lg mx-auto my-12 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E9DDE7] text-[#422C42] flex items-center justify-center mx-auto">
                <RotateCcw className="w-5 h-5 text-[#9B668B]" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#422C42]">
                No gifts match this exact filter
              </h2>
              <p className="text-xs text-[#6E6770] leading-relaxed">
                Try widening your price range or switching your marketplace selection to see more personalized discoveries.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedSource("all");
                    setFilterCategory("all");
                    setMaxPrice(50000);
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 bg-[#422C42] text-white text-xs font-semibold rounded-xl hover:bg-[#9B668B] transition-colors"
                >
                  Reset all filters
                </button>
              </div>
            </div>
          )}

          {/* Visual Inspiration Section (Pinterest Ideas) */}
          {visualInspirations.length > 0 && (
            <section className="mt-12 pt-8 border-t border-[#E6DDE5]">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E60023]/10 text-[#E60023] text-xs font-semibold mb-2">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Visual Inspiration & Aesthetics</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#422C42]">
                    Aesthetic Moodboards & Idea Pins
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6E6770] mt-1">
                    Explore creative styling, color palettes, and gift aesthetic ideas from Pinterest. These are inspiration pins, not commercial inventory.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visualInspirations.map((pin) => (
                  <div
                    key={pin.id}
                    className="group bg-white rounded-2xl border border-[#E6DDE5] overflow-hidden flex flex-col shadow-soft hover:shadow-card hover:border-[#E60023]/30 transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] w-full bg-[#FAF8F5] overflow-hidden">
                      <Image
                        src={pin.image_url}
                        alt={pin.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 z-10">
                        <span className="text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full bg-[#E60023] text-white shadow-xs">
                          Pinterest
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 z-10">
                        <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-white/95 text-[#422C42] border border-[#E6DDE5] backdrop-blur-xs">
                          Inspiration Only • No Price
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#29252A] group-hover:text-[#422C42] line-clamp-2">
                          {pin.title}
                        </h3>
                        <p className="mt-2 text-xs text-[#6E6770] line-clamp-3 leading-relaxed">
                          {pin.description}
                        </p>
                        {pin.tags && pin.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {pin.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-[#FAF8F5] text-[#8E8691] px-2 py-0.5 rounded-md border border-[#E6DDE5]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-[#E6DDE5]/80 flex items-center justify-between">
                        <span className="text-[11px] text-[#8E8691] italic">
                          Visual concept
                        </span>
                        <a
                          href={pin.inspiration_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E60023] hover:text-[#ad0018] bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <span>Explore on Pinterest</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* External AI Discovery Prompt (ChatGPT) */}
          {externalAi && (
            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-[#FAF8F5] to-[#F8F5F0] border border-emerald-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-bold text-[#422C42]">
                      {externalAi.title}
                    </h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      AI Inspiration
                    </span>
                  </div>
                  <p className="text-xs text-[#6E6770] mt-1 max-w-2xl leading-relaxed">
                    {externalAi.description}
                  </p>
                </div>
              </div>
              <a
                href={externalAi.destination_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 shadow-xs self-stretch sm:self-auto justify-center"
              >
                <span>Brainstorm in ChatGPT</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

        </main>
      </div>

      <CompareFloatingBar />
    </div>
  );
}

function ResultsLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
      <div className="flex items-center gap-3 text-xs font-semibold text-[#422C42]" role="status">
        <Sparkles className="w-5 h-5 text-[#9B668B] animate-spin" />
        <span>Loading your personalized gift results...</span>
      </div>
    </div>
  );
}

export default function DiscoverResultsPage() {
  return (
    <Suspense fallback={<ResultsLoadingFallback />}>
      <DiscoverResultsContent />
    </Suspense>
  );
}
