"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  Heart,
  Layers,
  Check,
  Star,
  Gift,
  Compass
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SafeImage } from "@/components/ui/SafeImage";
import { CompareFloatingBar } from "@/components/products/CompareFloatingBar";
import { OCCASIONS_LIST, MOCK_PRODUCTS } from "@/data/mockProducts";
import { useGiftora } from "@/context/GiftoraContext";
import { formatPriceINR } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const { updateSearchCriteria, toggleWishlist, isInWishlist, toggleCompare, isInCompare } = useGiftora();
  
  // Hero Interactive Search State
  const [heroPrompt, setHeroPrompt] = useState("");
  const [selectedRecipientType, setSelectedRecipientType] = useState("Sister");
  const [activeCollectionTab, setActiveCollectionTab] = useState<string>("under-500");

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchCriteria({
      recipientName: selectedRecipientType,
      relationship: selectedRecipientType,
      query: heroPrompt || `Thoughtful gift for my ${selectedRecipientType}`,
    });
    router.push(`/discover?prompt=${encodeURIComponent(heroPrompt)}`);
  };

  const recipientsList = [
    {
      id: "mother",
      name: "Mother",
      subtitle: "Comfort & Grace",
      image: "/images/categories/beauty.jpg",
      giftCount: "85+ Gifts",
      badge: "Pampering",
    },
    {
      id: "father",
      name: "Father",
      subtitle: "Gourmet & Craft",
      image: "/images/categories/gourmet.jpg",
      giftCount: "70+ Gifts",
      badge: "Appreciation",
    },
    {
      id: "sister",
      name: "Sister",
      subtitle: "Style & Scents",
      image: "/images/categories/fashion.jpg",
      giftCount: "90+ Gifts",
      badge: "Cherished",
    },
    {
      id: "brother",
      name: "Brother",
      subtitle: "Everyday Tech",
      image: "/images/categories/technology.jpg",
      giftCount: "65+ Gifts",
      badge: "Modern",
    },
    {
      id: "partner",
      name: "Partner",
      subtitle: "Romantic Keepsakes",
      image: "/images/hero/luxury_gift_hero.jpg",
      giftCount: "110+ Gifts",
      badge: "Soulmate",
    },
    {
      id: "best-friend",
      name: "Best Friend",
      subtitle: "Fun & Meaningful",
      image: "/images/categories/home_living.jpg",
      giftCount: "95+ Gifts",
      badge: "Laughter",
    },
    {
      id: "colleague",
      name: "Colleague",
      subtitle: "Polished & Useful",
      image: "/images/categories/stationery.jpg",
      giftCount: "60+ Gifts",
      badge: "Gratitude",
    },
  ];

  const collectionCategories = [
    { id: "under-500", label: "Gifts Under ₹500" },
    { id: "luxury", label: "Thoughtful Luxury" },
    { id: "tech", label: "Minimalist Tech Gifts" },
    { id: "wellness", label: "Self-Care & Wellness" },
    { id: "handmade", label: "Handmade with Love" },
    { id: "personalized", label: "Personalized Gifts" },
  ];

  const getFilteredCollectionProducts = () => {
    switch (activeCollectionTab) {
      case "under-500":
        return MOCK_PRODUCTS.filter((p) => p.tags.includes("Under ₹500")).slice(0, 4);
      case "luxury":
        return MOCK_PRODUCTS.filter((p) => p.price >= 3500 || p.tags.includes("Luxury") || p.source === "Tata CLiQ Luxury").slice(0, 4);
      case "tech":
        return MOCK_PRODUCTS.filter((p) => p.tags.includes("Tech Lovers") || p.category === "Technology" || p.category === "Audio").slice(0, 4);
      case "wellness":
        return MOCK_PRODUCTS.filter((p) => p.tags.includes("Wellness") || p.tags.includes("Self-Care") || p.category === "Ayurvedic Luxury").slice(0, 4);
      case "handmade":
        return MOCK_PRODUCTS.filter((p) => p.tags.includes("Handmade") || p.tags.includes("Artisan") || p.source === "Etsy" || p.source === "Fabindia").slice(0, 4);
      case "personalized":
        return MOCK_PRODUCTS.filter((p) => p.tags.includes("Personalized") || p.tags.includes("Unique for Special") || p.category === "Custom & Keepsake").slice(0, 4);
      default:
        return MOCK_PRODUCTS.slice(0, 4);
    }
  };

  const passionCategories = [
    {
      id: "home",
      title: "Home & Living",
      count: "95+ Curated Gifts",
      image: "/images/categories/home_living.jpg",
      bgClass: "bg-[#EFE5D9]",
      textClass: "text-[#422C42]",
      tag: "Ceramics & Scents",
      colSpan: "col-span-1 md:col-span-2",
    },
    {
      id: "fashion",
      title: "Fashion & Scarves",
      count: "70+ Curated Gifts",
      image: "/images/categories/fashion.jpg",
      bgClass: "bg-[#EAD9E5]",
      textClass: "text-[#422C42]",
      tag: "Silk & Accessories",
      colSpan: "col-span-1",
    },
    {
      id: "beauty",
      title: "Beauty & Wellness",
      count: "80+ Curated Gifts",
      image: "/images/categories/beauty.jpg",
      bgClass: "bg-[#FAF8F5]",
      textClass: "text-[#422C42]",
      tag: "Organic & Botanicals",
      colSpan: "col-span-1",
    },
    {
      id: "gourmet",
      title: "Artisanal Coffee & Tea",
      count: "65+ Curated Gifts",
      image: "/images/categories/gourmet.jpg",
      bgClass: "bg-[#C9826D]/20",
      textClass: "text-[#422C42]",
      tag: "Single Origin & Sets",
      colSpan: "col-span-1 md:col-span-2",
    },
    {
      id: "technology",
      title: "Tech & Everyday Carry",
      count: "50+ Curated Gifts",
      image: "/images/categories/technology.jpg",
      bgClass: "bg-[#A8B5A0]/30",
      textClass: "text-[#422C42]",
      tag: "Minimalist Essentials",
      colSpan: "col-span-1",
    },
    {
      id: "stationery",
      title: "Journaling & Stationery",
      count: "45+ Curated Gifts",
      image: "/images/categories/stationery.jpg",
      bgClass: "bg-[#EFE5D9]",
      textClass: "text-[#422C42]",
      tag: "Linen & Fine Paper",
      colSpan: "col-span-1",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5F0]">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================
            SECTION B — HERO (EDITORIAL PHOTOGRAPHY & INTERACTIVE SEARCH)
            ======================================================== */}
        <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-[#E6DDE5]">
          {/* Subtle soft backdrop accents */}
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#EAD9E5]/35 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#EFE5D9]/60 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              {/* Left Column: Editorial Headline & Interactive Search Bar */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAD9E5] border border-[#B77B9F]/30 text-[#422C42] text-xs font-semibold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-[#B77B9F]" />
                  <span>AI-Powered Personal Gifting</span>
                </div>

                <div className="space-y-3">
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#422C42] leading-[1.12]">
                    Make Every Gift Feel <span className="italic font-normal text-[#B77B9F]">Personal.</span>
                  </h1>
                  <p className="text-base sm:text-lg text-[#6E6770] leading-relaxed max-w-lg">
                    Tell us a little about them. We&apos;ll find the gift that feels just right.
                  </p>
                </div>

                {/* Primary & Secondary Hero CTAs */}
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-2 bg-[#422C42] hover:bg-[#9B668B] text-white px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold shadow-soft transition-all active:scale-95"
                  >
                    <span>Discover the Perfect Gift</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#collections"
                    className="inline-flex items-center gap-2 bg-white hover:bg-[#FAF8F5] text-[#422C42] border border-[#E6DDE5] px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold shadow-2xs hover:border-[#9B668B] transition-all"
                  >
                    <span>Explore Gift Collections</span>
                  </a>
                </div>

                {/* Interactive Search Bar Form */}
                <form
                  onSubmit={handleHeroSubmit}
                  className="bg-white p-3.5 sm:p-5 rounded-3xl shadow-card border border-[#E6DDE5] space-y-3"
                >
                  {/* Recipient Selection Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[#8E8691] font-medium mr-1">For:</span>
                    {["Sister", "Partner", "Best Friend", "Mom", "Colleague"].map((rel) => (
                      <button
                        key={rel}
                        type="button"
                        onClick={() => setSelectedRecipientType(rel)}
                        className={`px-3 py-1 rounded-full font-medium transition-all ${
                          selectedRecipientType === rel
                            ? "bg-[#422C42] text-[#FAF8F5] shadow-xs"
                            : "bg-[#F8F5F0] text-[#6E6770] hover:bg-[#EAD9E5]/60 hover:text-[#422C42]"
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>

                  {/* Search Input & Button */}
                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8691]" />
                      <input
                        type="text"
                        value={heroPrompt}
                        onChange={(e) => setHeroPrompt(e.target.value)}
                        placeholder={`e.g. loves pour-over coffee, scented candles & quiet mornings...`}
                        className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-2xl pl-10 pr-3.5 py-3 text-sm text-[#29252A] placeholder-[#8E8691] focus:outline-none focus:border-[#B77B9F] focus:bg-white transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 bg-[#422C42] hover:bg-[#B77B9F] text-white px-6 py-3 rounded-2xl font-semibold text-sm shadow-soft transition-all active:scale-95 shrink-0"
                    >
                      <span>Find Gifts</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Suggestion tags */}
                  <div className="flex items-center gap-2 text-xs text-[#8E8691] flex-wrap pt-1">
                    <span className="font-medium text-[#422C42]">Trending:</span>
                    {[
                      "Soy Fig Candle",
                      "Mulberry Silk Mask",
                      "Chai Kulhad Set",
                      "Desk Wireless Stand",
                    ].map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setHeroPrompt(tag);
                          router.push(`/discover?prompt=${encodeURIComponent(tag)}`);
                        }}
                        className="text-[#6E6770] hover:text-[#422C42] hover:underline underline-offset-2"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </form>
              </div>

              {/* Right Column: Editorial Photo Collage with Floating Gift Preview */}
              <div className="lg:col-span-6 relative">
                <div className="relative mx-auto max-w-lg lg:max-w-none">
                  
                  {/* Primary Editorial Still Life */}
                  <div className="relative aspect-[5/4] sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-elevated border-4 border-white">
                    <SafeImage
                      src="/images/hero/luxury_gift_hero.jpg"
                      alt="Artisanal luxury gift wrapping with ribbons and florals"
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#422C42]/75 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#EAD9E5]">
                        Personalized Curation
                      </span>
                      <p className="font-serif text-lg sm:text-xl font-bold leading-tight mt-0.5">
                        Thoughtful presents across verified independent artisans.
                      </p>
                    </div>
                  </div>

                  {/* Floating Match Card 1: Fig Candle */}
                  <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-elevated border border-[#E6DDE5] max-w-[250px] hidden sm:block">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 bg-[#F8F5F0]">
                        <SafeImage
                          src="/images/categories/home_living.jpg"
                          alt="Soy Wax Fig Candle"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#B77B9F] uppercase tracking-wider block">
                          96% Personality Match
                        </span>
                        <p className="text-xs font-bold text-[#29252A] truncate">
                          Botanical Fig Candle
                        </p>
                        <p className="text-[11px] text-[#6E6770]">
                          Etsy • ₹449
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Match Card 2: Recipient Pill */}
                  <div className="absolute -top-4 -right-2 sm:-right-4 bg-[#422C42] text-[#FAF8F5] px-3.5 py-2 rounded-2xl shadow-elevated border border-[#5B405B] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B77B9F] animate-pulse" />
                    <span className="text-xs font-medium">Curating for Pooja • Birthday</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION C — OCCASION DISCOVERY (EVITE-INSPIRED VISUAL TILES)
            ======================================================== */}
        <section id="occasions" className="py-16 md:py-20 bg-[#FAF8F5] border-b border-[#E6DDE5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-[#B77B9F]">
                  Moments That Matter
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#422C42] mt-1">
                  Shop by Occasion
                </h2>
                <p className="text-xs sm:text-sm text-[#6E6770] mt-1">
                  Photography-led curations tailored to every celebration.
                </p>
              </div>
              <Link
                href="/discover"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#422C42] hover:text-[#B77B9F] transition-colors self-start sm:self-auto"
              >
                <span>Browse All Occasions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Asymmetrical Visual Tiles Grid (Evite Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5">
              
              {/* Tile 1: Birthday (Featured Large 6-col) */}
              <div
                onClick={() => {
                  updateSearchCriteria({ occasion: "Birthday" });
                  router.push(`/discover?occasion=Birthday`);
                }}
                className="lg:col-span-7 group relative aspect-[16/10] rounded-3xl overflow-hidden cursor-pointer shadow-soft hover:shadow-elevated transition-all duration-300 border border-[#E6DDE5]"
              >
                <SafeImage
                  src="/images/occasions/birthday.jpg"
                  alt="Birthday celebration with wrapped presents"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#422C42]/85 via-[#422C42]/30 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#EAD9E5] text-[#422C42] shadow-xs">
                    Most Popular
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[11px] font-medium text-[#EAD9E5] uppercase tracking-wider">
                    120+ Curated Gifts
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold mt-0.5 group-hover:text-[#EAD9E5] transition-colors">
                    Birthday Celebrations
                  </h3>
                  <p className="text-xs text-[#FAF8F5]/85 line-clamp-1 mt-0.5">
                    Thoughtful keepsakes and milestone presents designed to bring genuine smiles.
                  </p>
                </div>
              </div>

              {/* Tile 2: Anniversary (5-col) */}
              <div
                onClick={() => {
                  updateSearchCriteria({ occasion: "Anniversary" });
                  router.push(`/discover?occasion=Anniversary`);
                }}
                className="lg:col-span-5 group relative aspect-[16/10] sm:aspect-auto rounded-3xl overflow-hidden cursor-pointer shadow-soft hover:shadow-elevated transition-all duration-300 border border-[#E6DDE5]"
              >
                <SafeImage
                  src="/images/occasions/anniversary.jpg"
                  alt="Anniversary celebration roses and gifts"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#422C42]/85 via-[#422C42]/30 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-[#422C42] shadow-xs">
                    Romantic Keepsakes
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[11px] font-medium text-[#EAD9E5] uppercase tracking-wider">
                    85+ Curated Gifts
                  </span>
                  <h3 className="font-serif text-2xl font-bold mt-0.5 group-hover:text-[#EAD9E5] transition-colors">
                    Anniversaries
                  </h3>
                  <p className="text-xs text-[#FAF8F5]/85 line-clamp-1 mt-0.5">
                    Timeless tokens of shared journeys and cherished vows.
                  </p>
                </div>
              </div>

              {/* Remaining 5 Occasions: 4-col, 4-col, 4-col */}
              {OCCASIONS_LIST.slice(2).map((occ) => (
                <div
                  key={occ.id}
                  onClick={() => {
                    updateSearchCriteria({ occasion: occ.name });
                    router.push(`/discover?occasion=${encodeURIComponent(occ.name)}`);
                  }}
                  className="lg:col-span-4 group relative aspect-[16/11] rounded-3xl overflow-hidden cursor-pointer shadow-soft hover:shadow-elevated transition-all duration-300 border border-[#E6DDE5]"
                >
                  <SafeImage
                    src={occ.image}
                    alt={occ.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#422C42]/85 via-[#422C42]/20 to-transparent" />
                  
                  <div className="absolute top-3.5 left-3.5">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 text-[#422C42] shadow-xs">
                      {occ.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-medium text-[#EAD9E5] uppercase tracking-wider">
                      {occ.giftCount}
                    </span>
                    <h3 className="font-serif text-xl font-bold mt-0.5 group-hover:text-[#EAD9E5] transition-colors">
                      {occ.name}
                    </h3>
                    <p className="text-xs text-[#FAF8F5]/80 line-clamp-1 mt-0.5">
                      {occ.description}
                    </p>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* ========================================================
            EXPLORE BY RECIPIENT (VISUAL EDITORIAL CARDS)
            ======================================================== */}
        <section id="recipients" className="py-16 md:py-20 bg-white border-b border-[#E6DDE5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-[#B77B9F]">
                  Meaningful Bonds
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#422C42] mt-1">
                  Explore by Recipient
                </h2>
                <p className="text-xs sm:text-sm text-[#6E6770] mt-1">
                  Personalized curations honoring their unique personality and place in your heart.
                </p>
              </div>
              <Link
                href="/recipients"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#422C42] hover:text-[#B77B9F] transition-colors self-start sm:self-auto"
              >
                <span>View All Saved Profiles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Recipient Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5 sm:gap-4">
              {recipientsList.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => {
                    updateSearchCriteria({ recipientName: rec.name, relationship: rec.name });
                    router.push(`/discover?recipient=${encodeURIComponent(rec.name)}`);
                  }}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 border border-[#E6DDE5]"
                >
                  <SafeImage
                    src={rec.image}
                    alt={rec.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#422C42]/90 via-[#422C42]/30 to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-[#422C42] shadow-2xs">
                      {rec.badge}
                    </span>
                  </div>

                  {/* Text Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[9px] font-medium text-[#EAD9E5] uppercase tracking-wider block">
                      {rec.giftCount}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold leading-tight mt-0.5 group-hover:text-[#EAD9E5] transition-colors">
                      {rec.name}
                    </h3>
                    <p className="text-[10px] text-[#FAF8F5]/80 line-clamp-1 mt-0.5">
                      {rec.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================
            SECTION D — CURATED COLLECTIONS (VISUAL PRODUCT SHOWCASE)
            ======================================================== */}
        <section id="collections" className="py-16 md:py-20 bg-[#F8F5F0] border-b border-[#E6DDE5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header with Category Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-[#B77B9F]">
                  Curated Catalog
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#422C42] mt-1">
                  Curated Collections
                </h2>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {collectionCategories.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCollectionTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      activeCollectionTab === tab.id
                        ? "bg-[#422C42] text-[#FAF8F5] shadow-xs"
                        : "bg-white text-[#6E6770] border border-[#E6DDE5] hover:border-[#B77B9F]/50 hover:text-[#422C42]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {getFilteredCollectionProducts().map((product) => {
                const isFavorited = isInWishlist(product.id);
                const isCompared = isInCompare(product.id);

                return (
                  <div
                    key={product.id}
                    className="group relative bg-white rounded-2xl border border-[#E6DDE5] overflow-hidden flex flex-col shadow-soft hover:shadow-card hover:border-[#B77B9F]/50 transition-all duration-300"
                  >
                    {/* Media Container */}
                    <div className="relative aspect-[4/3] w-full bg-[#FAF8F5] overflow-hidden">
                      <SafeImage
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Source & Demo Tags */}
                      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/95 text-[#422C42] border border-[#E6DDE5] shadow-xs">
                          {product.source}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#422C42]/85 text-[#FAF8F5]">
                          DEMO
                        </span>
                      </div>

                      {/* Wishlist & Compare Quick Actions */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product);
                          }}
                          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-xs ${
                            isFavorited
                              ? "bg-[#B77B9F] text-white"
                              : "bg-white/90 text-[#422C42] hover:bg-white hover:text-[#B77B9F]"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFavorited ? "fill-white" : ""}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleCompare(product);
                          }}
                          aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
                          title="Compare side-by-side"
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-xs ${
                            isCompared
                              ? "bg-[#422C42] text-[#EAD9E5]"
                              : "bg-white/90 text-[#422C42] hover:bg-white"
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-[#8E8691] mb-1">
                          <span>{product.category}</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-[#422C42]">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {product.rating}
                          </span>
                        </div>
                        <h3 className="font-serif text-sm font-bold text-[#29252A] line-clamp-2 leading-snug group-hover:text-[#422C42]">
                          {product.title}
                        </h3>
                      </div>

                      <div className="pt-2 border-t border-[#E6DDE5] flex items-center justify-between">
                        <div>
                          <span className="text-base font-bold text-[#422C42]">
                            {formatPriceINR(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-[#8E8691] line-through ml-1.5">
                              {formatPriceINR(product.originalPrice)}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/discover?prompt=${encodeURIComponent(product.title)}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#B77B9F] hover:text-[#422C42] transition-colors"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Catalog Jump Button */}
            <div className="mt-10 text-center">
              <Link
                href="/discover/results"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-[#E6DDE5] hover:border-[#B77B9F] text-xs font-semibold text-[#422C42] shadow-soft hover:shadow-card transition-all"
              >
                <span>View Full Gift Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B77B9F]" />
              </Link>
            </div>

          </div>
        </section>

        {/* ========================================================
            SECTION E — GIFTORA DISCOVERY EXPERIENCE (VISUAL INTERACTION DEMO)
            ======================================================== */}
        <section id="how-it-works" className="py-16 md:py-20 bg-[#FAF8F5] border-b border-[#E6DDE5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-12 space-y-1">
              <span className="text-xs uppercase tracking-widest font-bold text-[#B77B9F]">
                The Intelligent Difference
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#422C42]">
                How Giftora Curates
              </h2>
              <p className="text-xs sm:text-sm text-[#6E6770]">
                A visual journey from persona to verified marketplace recommendation.
              </p>
            </div>

            {/* Interactive Visual Experience Flow (Not 3 Paragraphs!) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
              
              {/* Step 1: Persona Pill */}
              <div className="bg-white p-5 rounded-3xl border border-[#E6DDE5] shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EAD9E5] text-[#422C42]">
                      01 • Persona
                    </span>
                    <Sparkles className="w-4 h-4 text-[#B77B9F]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#422C42]">
                    Who are you shopping for?
                  </h3>
                </div>

                <div className="mt-4 p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#E6DDE5] space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#422C42] text-white flex items-center justify-center font-bold text-xs">
                      P
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#29252A]">Pooja Sharma</p>
                      <p className="text-[10px] text-[#8E8691]">Sister • 28th Birthday</p>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-[#E6DDE5]/60 flex items-center justify-between text-[11px] text-[#6E6770]">
                    <span>Target Budget:</span>
                    <span className="font-semibold text-[#422C42]">₹1,000 – ₹2,500</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Extracted Passion Chips */}
              <div className="bg-white p-5 rounded-3xl border border-[#E6DDE5] shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#A8B5A0]/30 text-[#422C42]">
                      02 • Passions
                    </span>
                    <Compass className="w-4 h-4 text-[#55694E]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#422C42]">
                    Nuanced Style Tags
                  </h3>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E6DDE5] text-[11px] font-medium text-[#422C42]">
                      🌿 Aromatherapy
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E6DDE5] text-[11px] font-medium text-[#422C42]">
                      ☕ Pour-Over Coffee
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E6DDE5] text-[11px] font-medium text-[#422C42]">
                      🏺 Terracotta Pottery
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E6DDE5] text-[11px] font-medium text-[#422C42]">
                      📖 Mindful Journaling
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8E8691] italic pt-1">
                    AI synthesizes emotional aesthetics into retail search queries.
                  </p>
                </div>
              </div>

              {/* Step 3: Verified Matching Card */}
              <div className="bg-white p-5 rounded-3xl border border-[#E6DDE5] shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#C9826D]/20 text-[#A55841]">
                      03 • 5-Factor Ranking
                    </span>
                    <Star className="w-4 h-4 text-[#A55841]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#422C42]">
                    Top Match Calibrated
                  </h3>
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-[#F8F5F0] border border-[#E6DDE5] flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0">
                    <SafeImage
                      src="/images/categories/home_living.jpg"
                      alt="Candle"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#B77B9F] uppercase tracking-wide">
                      94% Match • ₹449
                    </span>
                    <p className="text-xs font-bold text-[#29252A] truncate">
                      Botanical Fig Soy Candle
                    </p>
                    <p className="text-[10px] text-[#8E8691] line-clamp-1">
                      Pure soy, reusable ceramic vessel.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4: Comparison Preview */}
              <div className="bg-white p-5 rounded-3xl border border-[#E6DDE5] shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EFE5D9] text-[#422C42]">
                      04 • Direct Purchase
                    </span>
                    <Check className="w-4 h-4 text-[#422C42]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#422C42]">
                    Compare & Shop
                  </h3>
                </div>

                <div className="mt-4 space-y-2 text-[11px] text-[#6E6770]">
                  <div className="flex items-center justify-between py-1 border-b border-[#E6DDE5]">
                    <span>Sourcing:</span>
                    <span className="font-semibold text-[#422C42]">Etsy Artisan Direct</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#E6DDE5]">
                    <span>Delivery:</span>
                    <span className="font-semibold text-[#422C42]">3–5 Days (Verified)</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Quality Score:</span>
                    <span className="font-semibold text-[#B77B9F]">4.8 ★ (312 reviews)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION F — EDITORIAL CATEGORY SHOWCASE (ASYMMETRICAL GRID)
            ======================================================== */}
        <section className="py-16 md:py-20 bg-[#F8F5F0] border-b border-[#E6DDE5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-[#B77B9F]">
                  Curated Aesthetics
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#422C42] mt-1">
                  Browse by Passion
                </h2>
                <p className="text-xs sm:text-sm text-[#6E6770] mt-1">
                  Discover gift ideas crafted for specific hobbies, tastes, and lifestyle aesthetics.
                </p>
              </div>
            </div>

            {/* Asymmetrical Masonry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {passionCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    updateSearchCriteria({ query: cat.title });
                    router.push(`/discover?prompt=${encodeURIComponent(cat.title)}`);
                  }}
                  className={`${cat.colSpan} group relative aspect-[16/10] sm:aspect-auto sm:h-72 rounded-3xl overflow-hidden cursor-pointer shadow-soft hover:shadow-elevated transition-all duration-300 border border-[#E6DDE5]`}
                >
                  <SafeImage
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#422C42]/85 via-[#422C42]/25 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/90 text-[#422C42] shadow-xs">
                      {cat.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="text-[10px] uppercase tracking-wider text-[#EAD9E5] font-medium">
                      {cat.count}
                    </span>
                    <h3 className="font-serif text-2xl font-bold mt-0.5 group-hover:text-[#EAD9E5] transition-colors">
                      {cat.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================
            SECTION G — FINAL VISUAL CALL TO ACTION
            ======================================================== */}
        <section className="py-16 md:py-20 bg-[#422C42] text-white relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#B77B9F]/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#EAD9E5]/10 blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5B405B] text-[#EAD9E5] text-xs font-semibold tracking-wider uppercase">
              <Gift className="w-3.5 h-3.5 text-[#EAD9E5]" />
              Start Your Gifting Journey
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#FAF8F5] leading-tight">
              Ready to find their new favorite gift?
            </h2>

            <p className="text-sm sm:text-base text-[#EAD9E5]/80 max-w-lg mx-auto leading-relaxed">
              Skip generic gift cards and endless catalog browsing. Start a conversation with Giftora and find a gift they will genuinely cherish.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/discover"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#B77B9F] hover:bg-[#9B668B] text-white font-semibold text-sm shadow-elevated transition-all active:scale-95"
              >
                <span>Launch AI Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/recipients"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#301E30] hover:bg-[#5B405B] text-[#EAD9E5] border border-[#5B405B] font-semibold text-sm transition-all"
              >
                <span>Add Recipient Profile</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <CompareFloatingBar />
    </div>
  );
}
