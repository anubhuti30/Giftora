"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
          <span className="w-10 h-10 rounded-2xl bg-[#422C42] flex items-center justify-center text-[#E9DDE7] shadow-soft group-hover:bg-[#9B668B] transition-colors">
            <Sparkles className="w-5 h-5 text-[#E9DDE7]" />
          </span>
          <span className="font-serif text-3xl font-bold tracking-tight text-[#422C42]">
            Giftora
          </span>
        </Link>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#422C42]">
          Reset your password
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#6E6770]">
          Enter your email address and we will send you secure instructions to restore access.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-card border border-[#E6DDE5]">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#422C42]">
                Check your inbox
              </h2>
              <p className="text-xs text-[#6E6770] leading-relaxed">
                We&apos;ve sent password reset instructions to{" "}
                <span className="font-semibold text-[#422C42]">{email}</span>. Please review your email and click the recovery link.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#9B668B] hover:text-[#422C42] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8691]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#29252A] placeholder-[#8E8691] focus:outline-none focus:border-[#9B668B] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#422C42] hover:bg-[#9B668B] text-white py-3 px-4 rounded-xl text-xs font-semibold shadow-soft transition-all active:scale-95 disabled:opacity-70"
              >
                {isLoading ? <span>Sending instructions...</span> : <span>Send Reset Instructions</span>}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E6770] hover:text-[#422C42] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
