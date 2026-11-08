"use client";

import React, { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Sparkles, 
  Send, 
  ArrowRight, 
  User, 
  Check, 
  RotateCcw,
  Loader2
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { CompareFloatingBar } from "@/components/products/CompareFloatingBar";
import { useGiftora } from "@/context/GiftoraContext";
import { BUDGET_TIERS } from "@/data/mockProducts";
import { POPULAR_INTEREST_TAGS } from "@/data/mockRecipients";
import { ChatMessage } from "@/types";
import { api } from "@/lib/api";

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptParam = searchParams.get("prompt");
  const recipientParam = searchParams.get("recipient");
  const occasionParam = searchParams.get("occasion");

  const { activeSearch, updateSearchCriteria } = useGiftora();

  // Conversation State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (promptParam) {
      return [
        {
          id: "msg-1",
          sender: "assistant",
          text: "Hello! I'm your Giftora discovery assistant. Who are you looking to celebrate or surprise today?",
          timestamp: "Just now",
          step: "recipient",
          quickReplies: ["Sister", "Partner", "Best Friend", "Mom", "Colleague"],
        },
        {
          id: "msg-user-init",
          sender: "user",
          text: promptParam,
          timestamp: "Just now",
        },
        {
          id: "msg-ai-init",
          sender: "assistant",
          text: `Lovely! Based on "${promptParam}", what are some of their cherished hobbies, aesthetics, or current interests? Select from the curated tags below or tell me in your own words.`,
          timestamp: "Just now",
          step: "interests",
        },
      ];
    }
    return [
      {
        id: "msg-1",
        sender: "assistant",
        text: "Hello! I'm your Giftora discovery assistant. Who are you looking to celebrate or surprise today?",
        timestamp: "Just now",
        step: "recipient",
        quickReplies: ["Sister", "Partner", "Best Friend", "Mom", "Colleague"],
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState(promptParam || "");
  const [isThinking, setIsThinking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [selectedRecipient, setSelectedRecipient] = useState(recipientParam || activeSearch.recipientName || "Sister");
  const [selectedOccasion, setSelectedOccasion] = useState(occasionParam || activeSearch.occasion || "Birthday");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(activeSearch.interests || ["Ceramics & Pottery", "Aromatherapy & Candles"]);
  const [selectedBudget, setSelectedBudget] = useState(activeSearch.budgetRange || { min: 500, max: 2500 });
  const [recipientAge, setRecipientAge] = useState(activeSearch.age || "26-30");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleUserSendMessage = useCallback(async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsThinking(true);

    try {
      // Build history for multi-turn conversational context
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));
      history.push({ role: "user", content: textToSend });

      const res = await api.sendChatMessage(
        textToSend,
        conversationId || undefined,
        undefined,
        history
      );

      if (res.conversation_id) {
        setConversationId(res.conversation_id);
      }

      // Synchronize extracted profiling back into active search and UI state
      if (res.extracted_needs) {
        const needs = res.extracted_needs as {
          recipient_name?: string;
          relationship?: string;
          occasion?: string;
          interests?: string[];
          minimum_budget?: number;
          maximum_budget?: number;
        };

        if (needs.relationship) {
          setSelectedRecipient(needs.relationship);
        } else if (needs.recipient_name) {
          setSelectedRecipient(needs.recipient_name);
        }

        if (needs.occasion) {
          setSelectedOccasion(needs.occasion);
        }

        if (Array.isArray(needs.interests) && needs.interests.length > 0) {
          setSelectedInterests((prev) => {
            const combined = Array.from(new Set([...prev, ...needs.interests!]));
            return combined;
          });
        }

        if (typeof needs.minimum_budget === "number" || typeof needs.maximum_budget === "number") {
          setSelectedBudget((prev) => ({
            min: typeof needs.minimum_budget === "number" ? needs.minimum_budget : prev.min,
            max: typeof needs.maximum_budget === "number" ? needs.maximum_budget : prev.max,
          }));
        }
      }

      const replyText =
        res.reply_message?.message_content ||
        "I've noted that! What other specific details or aesthetics would they love?";

      const quickReplies = res.suggested_quick_replies || [];

      setMessages((prev) => [
        ...prev,
        {
          id: res.reply_message?.id || `ai-${Date.now()}`,
          sender: "assistant",
          text: replyText,
          timestamp: "Just now",
          quickReplies: quickReplies.length > 0 ? quickReplies : undefined,
        },
      ]);
    } catch (err: unknown) {
      console.warn("Real chat endpoint fallback:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "assistant",
          text: "I've noted that! Select from the curated options below or tell me about their personal style to refine recommendations.",
          timestamp: "Just now",
          quickReplies: ["Under ₹1,500", "Under ₹3,000", "Handmade & Artisanal", "Minimalist Modern"],
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }, [inputMessage, messages, conversationId]);

  const toggleInterest = (tag: string) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleLaunchResults = async () => {
    setIsSearching(true);
    const searchPayload = {
      recipientName: selectedRecipient,
      relationship: selectedRecipient,
      occasion: selectedOccasion,
      interests: selectedInterests,
      budgetRange: selectedBudget,
      age: recipientAge,
      query: inputMessage || `Gifts for ${selectedRecipient} on ${selectedOccasion}`,
    };
    updateSearchCriteria(searchPayload);

    try {
      const res = await api.searchGifts({
        recipient_name: selectedRecipient,
        relationship: selectedRecipient,
        occasion: selectedOccasion,
        interests: selectedInterests,
        minimum_budget: selectedBudget.min,
        maximum_budget: selectedBudget.max,
        query: searchPayload.query,
      });

      if (res?.search_id) {
        // Guest searches are intentionally not persisted server-side. Preserve the
        // exact API response for the results route instead of substituting mock data.
        try {
          sessionStorage.setItem(`giftora_search_${res.search_id}`, JSON.stringify(res.recommendations));
        } catch {}
        router.push(`/discover/results?search_id=${res.search_id}`);
      } else {
        router.push("/discover/results");
      }
    } catch {
      router.push("/discover/results");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5F0]">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        {/* Workspace Sidebar */}
        <AppSidebar />

        {/* Main AI Discovery Canvas */}
        <main className="flex-1 flex flex-col min-h-[calc(100vh-80px)] bg-[#F8F5F0]">
          
          {/* Top Assistant Header */}
          <div className="p-4 sm:p-6 bg-white border-b border-[#E6DDE5] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E9DDE7] text-[#422C42] flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 text-[#9B668B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-lg sm:text-xl font-bold text-[#422C42]">
                    AI Gift Discovery Assistant
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-[#6E6770]">
                  Conversational profiling across Amazon, Etsy, Tata CLiQ Luxury & artisans.
                </p>
              </div>
            </div>

            {/* Quick Reset */}
            <button
              onClick={() => {
                setMessages([
                  {
                    id: "msg-1",
                    sender: "assistant",
                    text: "Hello! Who are you looking to celebrate or surprise today?",
                    timestamp: "Just now",
                    step: "recipient",
                    quickReplies: ["Sister", "Partner", "Best Friend", "Mom", "Colleague"],
                  },
                ]);
              }}
              title="Reset conversation"
              className="p-2 rounded-xl text-[#8E8691] hover:text-[#422C42] hover:bg-[#FAF8F5] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Quick Suggested Scenario Banner */}
            <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E6DDE5] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#422C42]">
                <Sparkles className="w-4 h-4 text-[#9B668B] shrink-0" />
                <span>
                  <strong>Illustrative Scenario:</strong> &ldquo;I need a gift for my sister&rdquo; (Aromatherapy, under ₹2,500)
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedRecipient("Sister (Pooja)");
                  setSelectedOccasion("Birthday");
                  setSelectedInterests(["Aromatherapy & Candles", "Ceramics & Pottery"]);
                  handleUserSendMessage("I need a gift for my sister Pooja. She loves ceramics and cozy scents.");
                }}
                className="shrink-0 text-xs font-semibold text-[#9B668B] hover:text-[#422C42] bg-white px-3 py-1.5 rounded-xl border border-[#E6DDE5] shadow-xs"
              >
                Load Scenario
              </button>
            </div>

            {/* Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-semibold ${
                    msg.sender === "user"
                      ? "bg-[#422C42] text-white"
                      : "bg-[#E9DDE7] text-[#422C42]"
                  }`}
                >
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-[#9B668B]" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-3">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#422C42] text-[#FAF8F5] rounded-tr-none shadow-soft"
                        : "bg-white text-[#29252A] rounded-tl-none border border-[#E6DDE5] shadow-soft"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`block text-[10px] mt-1.5 ${
                        msg.sender === "user" ? "text-[#E9DDE7]/70 text-right" : "text-[#8E8691]"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Quick Reply Pills */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickReplies.map((qr) => (
                        <button
                          key={qr}
                          type="button"
                          onClick={() => handleUserSendMessage(qr)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-[#FAF8F5] text-[#422C42] border border-[#E6DDE5] shadow-2xs hover:border-[#9B668B] transition-all text-left"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Interactive Progressive Disclosure Controls */}
                  {msg.sender === "assistant" && (
                    <div className="bg-white p-4 rounded-2xl border border-[#E6DDE5] shadow-soft space-y-4">
                      
                      {/* 1. Recipient & Occasion Selector */}
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8691] block mb-2">
                          1. Recipient & Occasion
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {["Sister", "Partner", "Best Friend", "Mom", "Colleague", "Dad"].map((rel) => (
                            <button
                              key={rel}
                              type="button"
                              onClick={() => {
                                setSelectedRecipient(rel);
                                updateSearchCriteria({ recipientName: rel, relationship: rel });
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                                selectedRecipient.includes(rel)
                                  ? "bg-[#422C42] text-white shadow-xs"
                                  : "bg-[#FAF8F5] text-[#6E6770] hover:bg-[#E9DDE7]/50"
                              }`}
                            >
                              {rel}
                            </button>
                          ))}
                        </div>

                        {/* Occasion Pickers */}
                        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-[#8E8691] font-medium mr-1">For:</span>
                          {["Birthday", "Anniversary", "Graduation", "Festivals", "Thank You", "Just Because"].map((occ) => (
                            <button
                              key={occ}
                              type="button"
                              onClick={() => {
                                setSelectedOccasion(occ);
                                updateSearchCriteria({ occasion: occ });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                selectedOccasion === occ
                                  ? "bg-[#9B668B] text-white"
                                  : "bg-[#FAF8F5] text-[#6E6770] hover:bg-[#E9DDE7]/40"
                              }`}
                            >
                              {occ}
                            </button>
                          ))}
                        </div>

                        {/* Age Group Pickers */}
                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-[#8E8691] font-medium mr-1">Age:</span>
                          {["Under 18", "18-25", "26-30", "31-40", "41-50", "50+"].map((age) => (
                            <button
                              key={age}
                              type="button"
                              onClick={() => {
                                setRecipientAge(age);
                                updateSearchCriteria({ age });
                              }}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                                recipientAge === age
                                  ? "bg-[#422C42] text-white"
                                  : "bg-[#FAF8F5] text-[#6E6770] hover:bg-[#E9DDE7]/40"
                              }`}
                            >
                              {age}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Interests & Passion Chips */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8691]">
                            2. Passions & Interests (Select multiple)
                          </span>
                          <span className="text-[10px] text-[#9B668B] font-semibold">
                            {selectedInterests.length} selected
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_INTEREST_TAGS.map((tag) => {
                            const isSelected = selectedInterests.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => toggleInterest(tag)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                                  isSelected
                                    ? "bg-[#422C42] text-[#FAF8F5] shadow-xs"
                                    : "bg-[#FAF8F5] text-[#6E6770] border border-[#E6DDE5] hover:border-[#9B668B]"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-[#E9DDE7]" />}
                                <span>{tag}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Budget Range Options */}
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8691] block mb-2">
                          3. Budget Preference
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {BUDGET_TIERS.map((tier) => {
                            const isSelected = selectedBudget.min === tier.min && selectedBudget.max === tier.max;
                            return (
                              <button
                                key={tier.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBudget({ min: tier.min, max: tier.max });
                                  updateSearchCriteria({ budgetRange: { min: tier.min, max: tier.max } });
                                }}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all ${
                                  isSelected
                                    ? "bg-[#9B668B] text-white shadow-soft"
                                    : "bg-[#FAF8F5] text-[#6E6770] border border-[#E6DDE5] hover:border-[#9B668B]/50"
                                }`}
                              >
                                {tier.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action CTA */}
                      <div className="pt-2 flex items-center justify-between border-t border-[#E6DDE5]">
                        <div className="text-xs text-[#6E6770]">
                          Targeting: <strong className="text-[#422C42]">{selectedRecipient}</strong> • {selectedOccasion}
                        </div>
                        <button
                          type="button"
                          onClick={handleLaunchResults}
                          disabled={isSearching}
                          className="inline-flex items-center gap-2 bg-[#422C42] hover:bg-[#9B668B] disabled:opacity-75 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-soft transition-all active:scale-95"
                        >
                          {isSearching ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Searching Marketplaces...</span>
                            </>
                          ) : (
                            <>
                              <span>Discover Matched Gifts</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking Indicator */}
            {isThinking && (
              <div className="flex gap-3 max-w-xl">
                <div className="w-8 h-8 rounded-xl bg-[#E9DDE7] text-[#422C42] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#9B668B] animate-spin" />
                </div>
                <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-[#E6DDE5] shadow-soft flex items-center gap-2 text-xs text-[#6E6770]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B668B] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B668B] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B668B] animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 font-medium text-[#422C42]">
                    Giftora is analyzing preferences and matching artisan catalogs...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Bottom Message Composer */}
          <div className="p-4 sm:p-6 bg-white border-t border-[#E6DDE5]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserSendMessage();
              }}
              className="flex items-center gap-3 bg-[#FAF8F5] border border-[#E6DDE5] rounded-2xl p-2 pl-4 focus-within:border-[#9B668B] focus-within:bg-white transition-all shadow-inner"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Describe your person, an inside joke, or specific aesthetics..."
                className="w-full bg-transparent text-xs sm:text-sm text-[#29252A] placeholder-[#8E8691] focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Send response"
                className="w-10 h-10 rounded-xl bg-[#422C42] hover:bg-[#9B668B] text-white flex items-center justify-center shrink-0 transition-colors shadow-soft"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8E8691] px-1">
              <span>Press Enter to send. Clearly isolated demo interactions ready for FastAPI/AI streaming.</span>
              <button
                onClick={handleLaunchResults}
                className="font-semibold text-[#9B668B] hover:text-[#422C42] flex items-center gap-1"
              >
                <span>Skip straight to results</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </main>
      </div>

      <CompareFloatingBar />
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
          <div className="flex items-center gap-3 text-xs font-semibold text-[#422C42]">
            <Sparkles className="w-5 h-5 text-[#9B668B] animate-spin" />
            <span>Loading Giftora Discovery Assistant...</span>
          </div>
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}

