/**
 * Giftora API Client
 * Typed communication layer between Next.js frontend and FastAPI MySQL backend.
 * Gracefully handles offline backend with fallback responses.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  async login(formData: FormData | URLSearchParams) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(err.detail || "Authentication error");
    }
    const data = await response.json();
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async register(userData: { email: string; password: string; full_name: string; preferred_currency?: string }) {
    return this.request<{ id: string; email: string; full_name: string }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
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
      recommendations: unknown[];
    }>("/api/v1/search/gift-search", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // AI Chat Assistant
  async sendChatMessage(message: string, conversationId?: string, recipientId?: string) {
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
    }>("/api/v1/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        recipient_id: recipientId,
      }),
    });
  }

  // Recipients
  async getRecipients() {
    return this.request<unknown[]>("/api/v1/recipients");
  }

  async createRecipient(data: {
    name: string;
    relationship_type: string;
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
