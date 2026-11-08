"use client";

import React, { createContext, useContext, useState } from "react";
import { Product, Recipient, SearchCriteria, UserProfile } from "@/types";
import { MOCK_PRODUCTS } from "@/data/mockProducts";
import { INITIAL_RECIPIENTS } from "@/data/mockRecipients";

interface GiftoraContextType {
  wishlist: Product[];
  compareList: Product[];
  recipients: Recipient[];
  activeSearch: SearchCriteria;
  user: UserProfile | null;
  toast: string | null;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  toggleCompare: (product: Product) => void;
  isInCompare: (productId: string) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  addRecipient: (recipient: Omit<Recipient, "id" | "savedGiftCount">) => Recipient;
  updateRecipient: (recipient: Recipient) => void;
  deleteRecipient: (id: string) => void;
  updateSearchCriteria: (criteria: Partial<SearchCriteria>) => void;
  resetSearchCriteria: () => void;
  loginUser: (email: string, name?: string) => void;
  logoutUser: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  showToast: (message: string) => void;
}

const defaultSearchCriteria: SearchCriteria = {
  recipientName: "Pooja",
  relationship: "Sister",
  occasion: "Birthday",
  interests: ["Aromatherapy", "Ceramics", "Minimalist Fashion"],
  budgetRange: { min: 500, max: 2500 },
  query: "Something thoughtful and warm for quiet creative evenings",
  age: "26-30",
};

const defaultUserProfile: UserProfile = {
  name: "Ananya Sharma",
  email: "ananya.sharma@example.com",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  currency: "INR",
  notificationEmail: true,
  assistantTone: "warm",
  savedAddress: "Indiranagar, Bengaluru, KA 560038",
};

const GiftoraContext = createContext<GiftoraContextType | undefined>(undefined);

export function GiftoraProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("giftora_wishlist");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [MOCK_PRODUCTS[0], MOCK_PRODUCTS[3]];
  });

  const [compareList, setCompareList] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("giftora_compare");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [recipients, setRecipients] = useState<Recipient[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("giftora_recipients");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_RECIPIENTS;
  });

  const [activeSearch, setActiveSearch] = useState<SearchCriteria>(defaultSearchCriteria);

  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("giftora_user");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return defaultUserProfile;
  });

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      let updated: Product[];
      if (exists) {
        updated = prev.filter((item) => item.id !== product.id);
        showToast(`Removed "${product.title.slice(0, 24)}..." from wishlist`);
      } else {
        updated = [...prev, product];
        showToast(`Saved to your wishlist!`);
      }
      try {
        localStorage.setItem("giftora_wishlist", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => {
      const updated = prev.filter((item) => item.id !== productId);
      try {
        localStorage.setItem("giftora_wishlist", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast("Removed from wishlist");
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleCompare = (product: Product) => {
    setCompareList((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      let updated: Product[];
      if (exists) {
        updated = prev.filter((item) => item.id !== product.id);
        showToast(`Removed from comparison`);
      } else {
        if (prev.length >= 4) {
          showToast(`You can compare up to 4 gifts at a time.`);
          return prev;
        }
        updated = [...prev, product];
        showToast(`Added to comparison table (${updated.length}/4)`);
      }
      try {
        localStorage.setItem("giftora_compare", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const isInCompare = (productId: string) => {
    return compareList.some((item) => item.id === productId);
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => {
      const updated = prev.filter((item) => item.id !== productId);
      try {
        localStorage.setItem("giftora_compare", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearCompare = () => {
    setCompareList([]);
    try {
      localStorage.removeItem("giftora_compare");
    } catch {}
    showToast("Comparison cleared");
  };

  const addRecipient = (recipientData: Omit<Recipient, "id" | "savedGiftCount">): Recipient => {
    const newRecipient: Recipient = {
      ...recipientData,
      id: `rec-${Date.now()}`,
      savedGiftCount: 0,
      avatarUrl:
        recipientData.avatarUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    };
    const updated = [newRecipient, ...recipients];
    setRecipients(updated);
    try {
      localStorage.setItem("giftora_recipients", JSON.stringify(updated));
    } catch {}
    showToast(`Added "${newRecipient.name}" to your recipients!`);
    return newRecipient;
  };

  const updateRecipient = (updatedRecipient: Recipient) => {
    const updated = recipients.map((r) => (r.id === updatedRecipient.id ? updatedRecipient : r));
    setRecipients(updated);
    try {
      localStorage.setItem("giftora_recipients", JSON.stringify(updated));
    } catch {}
    showToast(`Updated "${updatedRecipient.name}"'s profile`);
  };

  const deleteRecipient = (id: string) => {
    const updated = recipients.filter((r) => r.id !== id);
    setRecipients(updated);
    try {
      localStorage.setItem("giftora_recipients", JSON.stringify(updated));
    } catch {}
    showToast("Recipient removed");
  };

  const updateSearchCriteria = (criteria: Partial<SearchCriteria>) => {
    setActiveSearch((prev) => ({ ...prev, ...criteria }));
  };

  const resetSearchCriteria = () => {
    setActiveSearch(defaultSearchCriteria);
  };

  const loginUser = (email: string, name?: string) => {
    const newUser: UserProfile = {
      name: name || email.split("@")[0],
      email: email,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      currency: "INR",
      notificationEmail: true,
      assistantTone: "warm",
    };
    setUser(newUser);
    try {
      localStorage.setItem("giftora_user", JSON.stringify(newUser));
    } catch {}
    showToast(`Welcome back, ${newUser.name}!`);
  };

  const logoutUser = () => {
    setUser(null);
    try {
      localStorage.removeItem("giftora_user");
    } catch {}
    showToast("Logged out successfully");
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      localStorage.setItem("giftora_user", JSON.stringify(updated));
    } catch {}
    showToast("Preferences saved successfully");
  };

  return (
    <GiftoraContext.Provider
      value={{
        wishlist,
        compareList,
        recipients,
        activeSearch,
        user,
        toast,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        toggleCompare,
        isInCompare,
        removeFromCompare,
        clearCompare,
        addRecipient,
        updateRecipient,
        deleteRecipient,
        updateSearchCriteria,
        resetSearchCriteria,
        loginUser,
        logoutUser,
        updateUserProfile,
        showToast,
      }}
    >
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#422C42] text-white px-5 py-3 rounded-xl shadow-elevated border border-[#9B668B]/40 animate-fade-in"
        >
          <span className="w-2 h-2 rounded-full bg-[#E9DDE7]" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </GiftoraContext.Provider>
  );
}

export function useGiftora() {
  const context = useContext(GiftoraContext);
  if (!context) {
    throw new Error("useGiftora must be used within a GiftoraProvider");
  }
  return context;
}
