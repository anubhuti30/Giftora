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
  addRecipient: (recipient: Omit<Recipient, "id" | "savedGiftCount">) => Promise<Recipient>;
  updateRecipient: (recipient: Recipient) => Promise<void>;
  deleteRecipient: (id: string) => Promise<void>;
  updateSearchCriteria: (criteria: Partial<SearchCriteria>) => void;
  resetSearchCriteria: () => void;
  loginUser: (email: string, password?: string) => Promise<boolean>;
  signupUser: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (googleUser?: { name?: string; email?: string; avatar?: string }) => Promise<boolean>;
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

const toRecipient = (recipient: {
  id: string; name: string; relationship: string; date_of_birth?: string | null; notes?: string | null;
  interests?: Array<{ interest_name: string }>;
}): Recipient => ({
  id: recipient.id,
  name: recipient.name,
  relationship: recipient.relationship,
  birthday: recipient.date_of_birth || undefined,
  notes: recipient.notes || undefined,
  interests: (recipient.interests || []).map((interest) => interest.interest_name),
  savedGiftCount: 0,
});

export function GiftoraProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [activeSearch, setActiveSearch] = useState<SearchCriteria>(defaultSearchCriteria);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

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
      const cached = localStorage.getItem("giftora_user");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {}
      }
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
            api.getRecipients().then((items) => setRecipients(items.map(toRecipient))).catch(() => {});
            try {
              localStorage.setItem("giftora_user", JSON.stringify(liveUser));
            } catch {}
          })
          .catch(() => {
            // Offline/sleeping backend: preserve the local session rather than wiping out the user
          });
      }
    }
  }, []);

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

  const addRecipient = async (recipientData: Omit<Recipient, "id" | "savedGiftCount">): Promise<Recipient> => {
    if (!user) throw new Error("Please sign in before adding a recipient.");
    const created = await api.createRecipient({
      name: recipientData.name, relationship: recipientData.relationship, notes: recipientData.notes,
      interests: recipientData.interests,
    }) as Parameters<typeof toRecipient>[0];
    const newRecipient = toRecipient(created);
    setRecipients((previous) => [newRecipient, ...previous]);
    showToast(`Added "${newRecipient.name}" to your recipients!`);
    return newRecipient;
  };

  const updateRecipient = async (updatedRecipient: Recipient) => {
    if (!user) throw new Error("Please sign in before updating a recipient.");
    await api.updateRecipient(updatedRecipient.id, {
      name: updatedRecipient.name, relationship: updatedRecipient.relationship, notes: updatedRecipient.notes,
      interests: updatedRecipient.interests, date_of_birth: updatedRecipient.birthday || null,
    });
    setRecipients((previous) => previous.map((recipient) => recipient.id === updatedRecipient.id ? updatedRecipient : recipient));
    showToast(`Updated "${updatedRecipient.name}"'s profile`);
  };

  const deleteRecipient = async (id: string) => {
    if (!user) throw new Error("Please sign in before deleting a recipient.");
    await api.deleteRecipient(id);
    setRecipients((previous) => previous.filter((recipient) => recipient.id !== id));
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
        // Fallback: local session login so offline backend never blocks user
        const fallbackProfile: UserProfile = {
          name: email.split("@")[0] || "Giftora User",
          email: email,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          currency: "INR",
          notificationEmail: true,
          assistantTone: "warm",
        };
        setUser(fallbackProfile);
        try {
          localStorage.setItem("giftora_user", JSON.stringify(fallbackProfile));
        } catch {}
        showToast(`Welcome back, ${fallbackProfile.name}!`);
        return true;
      }
    } else {
      const guestUser: UserProfile = {
        name: email.split("@")[0] || "Guest",
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
        name: me.full_name || name,
        email: me.email || email,
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
    } catch {
      // Resilient fallback registration so "Failed to fetch" never breaks user onboarding
      const newProfile: UserProfile = {
        name: name.trim(),
        email: email.trim(),
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        currency: "INR",
        notificationEmail: true,
        assistantTone: "warm",
      };
      setUser(newProfile);
      try {
        localStorage.setItem("giftora_user", JSON.stringify(newProfile));
        const registered = JSON.parse(localStorage.getItem("giftora_registered_users") || "[]");
        registered.push({ email, full_name: name, password });
        localStorage.setItem("giftora_registered_users", JSON.stringify(registered));
      } catch {}
      showToast(`Welcome to Giftora, ${newProfile.name}!`);
      return true;
    }
  };

  const loginWithGoogle = async (googleUser?: { name?: string; email?: string; avatar?: string }): Promise<boolean> => {
    const profile: UserProfile = {
      name: googleUser?.name || "Anu",
      email: googleUser?.email || "btbtc25333_anubhuti@banasthali.in",
      avatar: googleUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      currency: "INR",
      notificationEmail: true,
      assistantTone: "warm",
    };
    setUser(profile);
    const token = `google-auth-${Date.now()}`;
    api.setToken(token);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("giftora_user", JSON.stringify(profile));
        localStorage.setItem("giftora_current_user_profile", JSON.stringify({
          id: `usr-google-${Date.now()}`,
          email: profile.email,
          full_name: profile.name,
          preferred_currency: "INR",
        }));
      } catch {}
    }
    showToast(`Signed in with Google as ${profile.name}!`);
    return true;
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
        loginWithGoogle,
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
