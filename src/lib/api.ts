/**
 * Giftora API Client
 * Typed communication layer between Next.js frontend and FastAPI MySQL backend.
 * Gracefully handles offline backend with fallback responses.
 */

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

class GiftoraApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("giftora_auth_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("giftora_auth_token", token);
      } else {
        localStorage.removeItem("giftora_auth_token");
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(err.detail || `API error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`[Giftora API] Request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  // Health
  async getHealth() {
    return this.request<{ status: string; environment: string; version: string }>("/health");
  }

  async getDatabaseHealth() {
    return this.request<{ database: string; connected: boolean; status: string }>("/health/database");
  }

  // Auth
  async login(credentials: { email: string; password: string }) {
    const data = await this.request<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async register(userData: { email: string; password: string; full_name: string; preferred_currency?: string }) {
    const data = await this.request<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async getMe() {
    return this.request<{ id: string; email: string; full_name: string; preferred_currency: string }>("/api/v1/auth/me");
  }

  // Search & Recommendations
  async searchGifts(params: {
    recipient_id?: string;
    recipient_name?: string;
    relationship?: string;
    occasion?: string;
    interests?: string[];
    minimum_budget?: number;
    maximum_budget?: number;
    query?: string;
  }) {
    return this.request<{
      search_id: string;
      query: string;
      extracted_needs: Record<string, unknown>;
      recommendations_count: number;
      recommendations: any[];
      visual_inspirations?: any[];
      external_ai_destination?: any;
    }>("/api/v1/search/gift-search", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async getSearchResults(searchId: string) {
    return this.request<{
      id: string;
      original_query: string;
      recommendations: Array<{
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
        review_count?: number | null;
        relevance_score: number;
        match_explanation: string;
        category?: string;
      }>;
      visual_inspirations?: any[];
      external_ai_destination?: any;
    }>(`/api/v1/search/${encodeURIComponent(searchId)}`);
  }

  // AI Chat Assistant
  async sendChatMessage(
    message: string,
    conversationId?: string,
    recipientId?: string,
    chatHistory?: { role: string; content: string }[]
  ) {
    return this.request<{
      conversation_id: string;
      reply_message: {
        id: string;
        conversation_id: string;
        sender_type: string;
        message_content: string;
        created_at: string;
      };
      extracted_needs?: Record<string, unknown>;
      suggested_quick_replies?: string[];
      recommended_search_id?: string;
    }>("/api/v1/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        recipient_id: recipientId,
        chat_history: chatHistory,
      }),
    });
  }

  // Recipients
  async getRecipients() {
    return this.request<Array<{
      id: string;
      name: string;
      relationship: string;
      date_of_birth?: string | null;
      notes?: string | null;
      interests?: Array<{ interest_name: string }>;
    }>>("/api/v1/recipients");
  }

  async createRecipient(data: {
    name: string;
    relationship: string;
    notes?: string;
    interests?: string[];
    minimum_budget?: number;
    maximum_budget?: number;
  }) {
    return this.request<unknown>("/api/v1/recipients", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRecipient(id: string, data: {
    name?: string;
    relationship?: string;
    date_of_birth?: string | null;
    notes?: string;
    interests?: string[];
  }) {
    return this.request<unknown>(`/api/v1/recipients/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteRecipient(id: string) {
    return this.request<{ message: string }>(`/api/v1/recipients/${id}`, {
      method: "DELETE",
    });
  }

  // Wishlist
  async getWishlist() {
    return this.request<{ wishlist_id: string; name: string; items: unknown[] }>("/api/v1/wishlist");
  }

  async addToWishlist(productSourceId: string) {
    return this.request<{ message: string; item_id: string }>("/api/v1/wishlist", {
      method: "POST",
      body: JSON.stringify({ product_source_id: productSourceId }),
    });
  }

  async removeFromWishlist(itemId: string) {
    return this.request<{ message: string }>(`/api/v1/wishlist/${itemId}`, {
      method: "DELETE",
    });
  }

  // Comparison
  async createComparison(productSourceIds: string[]) {
    return this.request<{ comparison_id: string; items_count: number }>("/api/v1/compare", {
      method: "POST",
      body: JSON.stringify({ product_source_ids: productSourceIds }),
    });
  }

  async getComparison(comparisonId: string) {
    return this.request<{ id: string; items: unknown[] }>(`/api/v1/compare/${comparisonId}`);
  }
}

export const api = new GiftoraApiClient();
