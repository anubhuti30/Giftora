export type MarketplaceSource =
  | "Etsy"
  | "Tata CLiQ Luxury"
  | "Amazon India"
  | "Flipkart"
  | "Myntra"
  | "Fabindia"
  | "Nicobar"
  | "Forest Essentials"
  | "Nykaa"
  | string;

export interface ProductValueComparison {
  pros: string[];
  idealFor: string;
  deliveryEstimate: string;
  sentimentRating: string;
  material?: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  currency: string;
  source: MarketplaceSource;
  category: string;
  rating?: number | null;
  reviewCount?: number | null;
  imageUrl: string;
  aiMatchReason: string;
  matchScore: number;
  tags: string[];
  occasions: string[];
  features: string[];
  productUrl?: string | null;
  retailerSearchUrl?: string;
  amazonUrl?: string;
  flipkartUrl?: string;
  myntraUrl?: string;
  linkStatus?: "VERIFIED" | "INCONCLUSIVE" | "INVALID" | "SEARCH_FALLBACK";
  isSearchFallback?: boolean;
  valueComparison: ProductValueComparison;
  isCuratedFavorite?: boolean;
}

export interface Recipient {
  id: string;
  name: string;
  relationship: string;
  ageGroup?: string;
  interests: string[];
  birthday?: string;
  notes?: string;
  avatarUrl?: string;
  savedGiftCount?: number;
}

export interface BudgetRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export interface SearchCriteria {
  recipientId?: string;
  recipientName: string;
  relationship: string;
  occasion: string;
  interests: string[];
  budgetRange: { min: number; max: number };
  query?: string;
  age?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  quickReplies?: string[];
  step?: "intro" | "recipient" | "interests" | "budget" | "complete";
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  currency: "INR" | "USD" | "EUR" | "GBP";
  notificationEmail: boolean;
  assistantTone: "warm" | "concise" | "creative";
  savedAddress?: string;
}
