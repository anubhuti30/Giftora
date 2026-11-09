"use client";

import React from "react";
import { 
  Heart, 
  Layers, 
  ExternalLink, 
  Sparkles, 
  Check, 
  Star 
} from "lucide-react";
import { Product } from "@/types";
import { formatPriceINR } from "@/lib/utils";
import { useGiftora } from "@/context/GiftoraContext";
import { SafeImage } from "@/components/ui/SafeImage";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist, toggleCompare, isInCompare } = useGiftora();

  const isFavorited = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const getSourceBadgeClass = (source: string) => {
    switch (source) {
      case "Tata CLiQ Luxury":
        return "bg-[#422C42] text-[#E9DDE7] border-[#5B405B]";
      case "Etsy":
        return "bg-[#F75A22]/10 text-[#C43806] border-[#F75A22]/20";
      case "Amazon India":
      case "Amazon":
        return "bg-amber-50 text-amber-900 border-amber-200";
      case "Flipkart":
        return "bg-blue-50 text-blue-900 border-blue-200";
      case "Myntra":
        return "bg-pink-50 text-pink-900 border-pink-200";
      case "Fabindia":
        return "bg-rose-50 text-[#834E74] border-rose-200";
      case "Nicobar":
        return "bg-stone-100 text-stone-800 border-stone-200";
      case "Forest Essentials":
        return "bg-amber-900/10 text-amber-900 border-amber-800/20";
      default:
        return "bg-[#F4EEF3] text-[#422C42] border-[#D5C7D3]";
    }
  };

  const isVerifiedProduct = product.linkStatus === "VERIFIED" && Boolean(product.productUrl);
  const destinationUrl = isVerifiedProduct 
    ? (product.productUrl || "") 
    : (product.retailerSearchUrl || product.productUrl || "");

  const buttonLabel = isVerifiedProduct 
    ? "View Product" 
    : `Search on ${product.source.replace(" India", "")}`;

  // Multi-retailer direct shopping links for Amazon, Flipkart, Myntra
  const amazonUrl = product.amazonUrl || `https://www.amazon.in/s?k=${encodeURIComponent(product.title)}`;
  const flipkartUrl = product.flipkartUrl || `https://www.flipkart.com/search?q=${encodeURIComponent(product.title)}`;
  const cleanKeywords = product.title.split(" ").slice(0, 3).join("-").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const myntraUrl = product.myntraUrl || `https://www.myntra.com/${cleanKeywords || "gifts"}`;

  return (
    <div className="group relative bg-white rounded-2xl border border-[#E6DDE5] overflow-hidden flex flex-col shadow-soft hover:shadow-card hover:border-[#9B668B]/40 transition-all duration-300">
      
      {/* Top Media Container */}
      <div className="relative aspect-[4/3] w-full bg-[#FAF8F5] overflow-hidden">
        <SafeImage
          src={product.imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          fallbackSrc="/images/hero/luxury_gift_hero.jpg"
        />

        {/* Source Marketplace Pill & Honest Verification Tag */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <span className={`text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full border shadow-xs ${getSourceBadgeClass(product.source)}`}>
            {product.source}
          </span>
          {product.isSearchFallback ? (
            <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 backdrop-blur-xs text-amber-900 border border-amber-300/40">
              Retailer Search
            </span>
          ) : isVerifiedProduct ? (
            <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 backdrop-blur-xs text-emerald-900 border border-emerald-300/40">
              Verified
            </span>
          ) : null}
        </div>

        {/* Action Buttons Overlay (Wishlist + Compare) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
              isFavorited
                ? "bg-[#9B668B] text-white"
                : "bg-white/90 text-[#422C42] hover:bg-white hover:text-[#9B668B]"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-white" : ""}`} />
          </button>

          {/* Compare Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleCompare(product);
            }}
            aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
            title="Compare side-by-side"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
              isCompared
                ? "bg-[#422C42] text-[#E9DDE7]"
                : "bg-white/90 text-[#422C42] hover:bg-white hover:text-[#422C42]"
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* AI Match Score Badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#E6DDE5] text-[11px] font-semibold text-[#422C42] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#9B668B]" />
            <span>{product.matchScore}% AI Match</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-[#6E6770] mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-[10px] text-[#9B668B]">
              {product.category}
            </span>
            {product.rating != null && product.rating > 0 && (
              <div className="flex items-center gap-1 font-medium text-[#29252A]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                {product.reviewCount != null && product.reviewCount > 0 && (
                  <span className="text-[#8E8691]">({product.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#29252A] group-hover:text-[#422C42] line-clamp-2 leading-snug">
            {product.title}
          </h3>

          {/* Price Row */}
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#422C42]">
              {formatPriceINR(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-[#8E8691] line-through">
                {formatPriceINR(product.originalPrice)}
              </span>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            )}
          </div>

          {/* AI Match Explanation */}
          <div className="mt-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6DDE5]/80 text-xs text-[#6E6770] leading-relaxed">
            <div className="flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#9B668B] shrink-0 mt-0.5" />
              <p className="line-clamp-2">
                <span className="font-semibold text-[#422C42]">Why this matches: </span>
                {product.aiMatchReason}
              </p>
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-4 pt-3.5 border-t border-[#E6DDE5]/80 flex flex-col gap-2.5">
          {/* Primary Action Button & Compare */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => toggleCompare(product)}
              className={`text-xs font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
                isCompared
                  ? "bg-[#E9DDE7] text-[#422C42] font-semibold"
                  : "text-[#6E6770] hover:bg-[#FAF8F5] hover:text-[#422C42]"
              }`}
            >
              {isCompared ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#9B668B]" />
                  <span>Comparing</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>Compare</span>
                </>
              )}
            </button>

            {destinationUrl ? (
              <a
                href={destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#422C42] hover:text-[#9B668B] bg-[#F4EEF3] hover:bg-[#E9DDE7] px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>{buttonLabel}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="inline-flex items-center text-xs font-medium text-[#8E8691] bg-gray-100 px-3 py-1.5 rounded-lg cursor-not-allowed">
                Retailer link unavailable
              </span>
            )}
          </div>

          {/* Quick Shopping Destinations for Amazon, Flipkart, Myntra */}
          <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-[#FAF8F5] text-[11px]">
            <span className="font-medium text-[10px] uppercase tracking-wider text-[#8E8691]">Shop on:</span>
            <div className="flex items-center gap-1">
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Search on Amazon India"
                className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-medium transition-colors"
              >
                Amazon
              </a>
              <a
                href={flipkartUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Search on Flipkart"
                className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 font-medium transition-colors"
              >
                Flipkart
              </a>
              <a
                href={myntraUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Search on Myntra"
                className="px-2 py-0.5 rounded bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200/80 font-medium transition-colors"
              >
                Myntra
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
