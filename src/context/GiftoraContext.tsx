"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Recipient, SearchCriteria, UserProfile } from "@/types";
import { api } from "@/lib/api";

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
  loginUser: (email: string, password?: string) => Promise<boolean>;
  signupUser: (name: string, email: string, password: string) => Promise<boolean>;
  logoutUser: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  showToast: (message: string) => void;
}

const defaultSearchCriteria: SearchCriteria = {
  recipientName: "",
  relationship: "",
  occasion: "",
  interests: [],
  budgetRange: { min: 1000, max: 5000 },
  query: "",
  age: "",
};

const GiftoraContext = createContext<GiftoraContextType | undefined>(undefined);

export function GiftoraProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [activeSearch, setActiveSearch] = useState<SearchCriteria>(defaultSearchCriteria);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Hydrate client-side state from localStorage cleanly after mount (prevents SSR hydration mismatch)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedWishlist = localStorage.getItem("giftora_wishlist");
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
        const savedCompare = localStorage.getItem("giftora_compare");
        if (savedCompare) setCompareList(JSON.parse(savedCompare));
        const savedRecipients = localStorage.getItem("giftora_recipients");
        if (savedRecipients) setRecipients(JSON.parse(savedRecipients));
        const savedUser = localStorage.getItem("giftora_user");
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to load local storage state:", e);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Verify and sync genuine backend session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("giftora_auth_token");
      if (token) {
        api.getMe()
          .then((me) => {
            const liveUser: UserProfile = {
              name: me.full_name,
              email: me.email,
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
              currency: (me.preferred_currency as UserProfile["currency"]) || "INR",
              notificationEmail: true,
              assistantTone: "warm",
            };
            setUser(liveUser);
            try {
              localStorage.setItem("giftora_user", JSON.stringify(liveUser));
            } catch {}
          })
          .catch(() => {
            // Token expired or invalid
            api.setToken(null);
            setUser(null);
            try {
              localStorage.removeItem("giftora_user");
            } catch {}
          });
      }
    }
  }, []);

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

  const loginUser = async (email: string, password?: string): Promise<boolean> => {
    if (password) {
      try {
        await api.login({ email, password });
        const me = await api.getMe();
        const profile: UserProfile = {
          name: me.full_name,
          email: me.email,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          currency: (me.preferred_currency as UserProfile["currency"]) || "INR",
          notificationEmail: true,
          assistantTone: "warm",
        };
        setUser(profile);
        try {
          localStorage.setItem("giftora_user", JSON.stringify(profile));
        } catch {}
        showToast(`Welcome back, ${profile.name}!`);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Authentication failed";
        showToast(msg);
        throw err;
      }
    } else {
      const guestUser: UserProfile = {
        name: email.split("@")[0],
        email: email,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        currency: "INR",
        notificationEmail: true,
        assistantTone: "warm",
      };
      setUser(guestUser);
      try {
        localStorage.setItem("giftora_user", JSON.stringify(guestUser));
      } catch {}
      showToast(`Welcome, ${guestUser.name}!`);
      return true;
    }
  };

  const signupUser = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      await api.register({ full_name: name, email, password });
      const me = await api.getMe();
      const newProfile: UserProfile = {
        name: me.full_name,
        email: me.email,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        currency: (me.preferred_currency as UserProfile["currency"]) || "INR",
        notificationEmail: true,
        assistantTone: "warm",
      };
      setUser(newProfile);
      try {
        localStorage.setItem("giftora_user", JSON.stringify(newProfile));
      } catch {}
      showToast(`Welcome to Giftora, ${newProfile.name}!`);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      showToast(msg);
      throw err;
    }
  };

  const logoutUser = () => {
    setUser(null);
    api.setToken(null);
    try {
      localStorage.removeItem("giftora_user");
      localStorage.removeItem("giftora_auth_token");
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
        signupUser,
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
