"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Layers, ArrowRight, X } from "lucide-react";
import { useGiftora } from "@/context/GiftoraContext";

export function CompareFloatingBar() {
  const { compareList, removeFromCompare, clearCompare } = useGiftora();

  if (compareList.length === 0) return null;

  return (
    <aside
      aria-label="Product comparison bar"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-[#422C42] text-white rounded-2xl shadow-elevated border border-[#9B668B]/40 p-3 sm:p-4 flex items-center justify-between gap-4">
        
        {/* Left: Selected Thumbnails & Count */}
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-[#E9DDE7] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#E9DDE7]" />
              Comparing ({compareList.length}/4)
            </span>
            <span className="text-[11px] text-[#FAF8F5]/70">
              Side-by-side analysis
            </span>
          </div>

          <div className="flex items-center gap-2">
            {compareList.map((product) => (
              <div key={product.id} className="relative group/thumb shrink-0">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#9B668B] bg-white relative">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFromCompare(product.id)}
                  aria-label={`Remove ${product.title} from comparison`}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#9B668B] hover:bg-rose-500 text-white flex items-center justify-center text-[10px] shadow-sm transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => clearCompare()}
            className="text-xs text-[#E9DDE7]/70 hover:text-white px-2.5 py-1.5 transition-colors hidden sm:inline"
          >
            Clear all
          </button>
          
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 bg-[#9B668B] hover:bg-[#834E74] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-soft transition-all active:scale-95"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
