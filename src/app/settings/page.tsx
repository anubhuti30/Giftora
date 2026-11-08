"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  Download 
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useGiftora } from "@/context/GiftoraContext";
import { UserProfile } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUserProfile, logoutUser, showToast } = useGiftora();

  const [name, setName] = useState(user?.name || "Ananya Sharma");
  const [email, setEmail] = useState(user?.email || "ananya.sharma@example.com");
  const [currency, setCurrency] = useState<UserProfile["currency"]>(user?.currency || "INR");
  const [tone, setTone] = useState<UserProfile["assistantTone"]>(user?.assistantTone || "warm");
  const [notifications, setNotifications] = useState(user?.notificationEmail ?? true);
  const [savedAddress, setSavedAddress] = useState(user?.savedAddress || "Indiranagar, Bengaluru, KA 560038");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      currency,
      assistantTone: tone,
      notificationEmail: notifications,
      savedAddress,
    });
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5F0]">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        <AppSidebar />

        <main className="flex-1 flex flex-col min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-[#8E8691] mb-2">
              <Link href="/discover" className="hover:text-[#422C42] flex items-center gap-1">
                <span>Workspace</span>
              </Link>
              <span>/</span>
              <span className="text-[#422C42] font-semibold">Settings & Preferences</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#422C42]">
              Account Settings
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6770] mt-1">
              Manage your personal profile, gifting preferences, and security settings.
            </p>
          </div>

          <div className="max-w-3xl space-y-8">
            
            {/* Section 1: Profile Information */}
            <div className="bg-white rounded-3xl border border-[#E6DDE5] p-6 sm:p-8 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-[#E9DDE7] text-[#422C42] flex items-center justify-center">
                  <User className="w-5 h-5 text-[#9B668B]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#422C42]">
                    Profile Information
                  </h2>
                  <p className="text-xs text-[#6E6770]">
                    Your name and identity across saved gift registries.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4 pb-2">
                  <div className="w-16 h-16 rounded-2xl bg-[#E9DDE7] text-[#422C42] font-serif font-bold text-2xl flex items-center justify-center border border-[#E6DDE5]">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#422C42] block">
                      Profile Avatar
                    </span>
                    <span className="text-[11px] text-[#8E8691]">
                      Generated from your account identity.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3.5 py-2.5 text-xs text-[#29252A] focus:outline-none focus:border-[#9B668B] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3.5 py-2.5 text-xs text-[#29252A] focus:outline-none focus:border-[#9B668B] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                      Default Delivery City / Address
                    </label>
                    <input
                      type="text"
                      value={savedAddress}
                      onChange={(e) => setSavedAddress(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3.5 py-2.5 text-xs text-[#29252A] focus:outline-none focus:border-[#9B668B] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                      Preferred Display Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as UserProfile["currency"])}
                      className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3.5 py-2.5 text-xs text-[#29252A] focus:outline-none focus:border-[#9B668B] focus:bg-white"
                    >
                      <option value="INR">INR (₹) — Indian Rupee</option>
                      <option value="USD">USD ($) — US Dollar</option>
                      <option value="EUR">EUR (€) — Euro</option>
                      <option value="GBP">GBP (£) — British Pound</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#422C42] hover:bg-[#9B668B] text-white text-xs font-semibold rounded-xl shadow-soft transition-all"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Section 2: Gifting Preferences & AI Persona */}
            <div className="bg-white rounded-3xl border border-[#E6DDE5] p-6 sm:p-8 shadow-soft space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E9DDE7] text-[#422C42] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#9B668B]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#422C42]">
                    Gifting Preferences & Assistant Style
                  </h2>
                  <p className="text-xs text-[#6E6770]">
                    Customize how the AI talks to you and presents gift ideas.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Tone options */}
                <div>
                  <label className="block text-xs font-semibold text-[#422C42] mb-2">
                    AI Assistant Discovery Tone
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "warm", label: "Warm & Empathetic", desc: "Focuses on emotional connection and thoughtfulness" },
                      { id: "concise", label: "Concise & Direct", desc: "Fast specs, price advantages, and immediate links" },
                      { id: "creative", label: "Creative & Eclectic", desc: "Prioritizes unusual artisan finds and surprise factor" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          const selectedTone = t.id as UserProfile["assistantTone"];
                          setTone(selectedTone);
                          updateUserProfile({ assistantTone: selectedTone });
                        }}
                        className={`p-3.5 rounded-2xl text-left border transition-all ${
                          tone === t.id
                            ? "bg-[#FAF8F5] border-[#9B668B] shadow-xs"
                            : "border-[#E6DDE5] hover:bg-[#FAF8F5]"
                        }`}
                      >
                        <span className="text-xs font-bold text-[#422C42] block">
                          {t.label}
                        </span>
                        <span className="text-[11px] text-[#8E8691] mt-1 block">
                          {t.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DDE5]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-[#422C42] flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-[#9B668B]" />
                      Occasion Reminders
                    </span>
                    <span className="text-[11px] text-[#8E8691] block">
                      Receive friendly email reminders 7 days before saved birthdays.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => {
                      setNotifications(e.target.checked);
                      updateUserProfile({ notificationEmail: e.target.checked });
                    }}
                    className="w-4 h-4 text-[#9B668B] border-[#E6DDE5] rounded focus:ring-[#9B668B]"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Privacy, Data & Account Actions */}
            <div className="bg-white rounded-3xl border border-[#E6DDE5] p-6 sm:p-8 shadow-soft space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E9DDE7] text-[#422C42] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#9B668B]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#422C42]">
                    Privacy & Account Security
                  </h2>
                  <p className="text-xs text-[#6E6770]">
                    Manage your data transparency and active session.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E6DDE5] text-xs">
                  <div>
                    <span className="font-semibold text-[#422C42] block">
                      Export Saved Discovery Data
                    </span>
                    <span className="text-[11px] text-[#8E8691]">
                      Download a JSON file with all your saved recipients and wishlists.
                    </span>
                  </div>
                  <button
                    onClick={() => showToast("Export initiated: Giftora_Data.json")}
                    className="px-3.5 py-1.5 rounded-lg border border-[#E6DDE5] hover:bg-[#FAF8F5] text-xs font-semibold text-[#422C42] flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 text-xs">
                  <div>
                    <span className="font-semibold text-rose-900 block">
                      Sign Out of Giftora
                    </span>
                    <span className="text-[11px] text-rose-700">
                      Ends your active session on this device.
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
