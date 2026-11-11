"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { useGiftora } from "@/context/GiftoraContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, loginWithGoogle } = useGiftora();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("btbtc25333_anubhuti@banasthali.in");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await loginUser(email, password);
      router.push("/discover");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid email or password. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (userEmail?: string) => {
    try {
      setIsLoading(true);
      const emailToUse = userEmail || googleEmailInput || "btbtc25333_anubhuti@banasthali.in";
      const nameToUse = emailToUse.split("@")[0].replace(/[^a-zA-Z]/g, " ") || "Anubhuti";
      await loginWithGoogle({ email: emailToUse, name: nameToUse });
      setShowGoogleModal(false);
      router.push("/discover");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google Sign-In failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header Brand */}
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
          Welcome back to Giftora
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#6E6770]">
          Sign in to access your saved recipients, curated gift wishlists, and previous searches.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-card border border-[#E6DDE5] space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <div>
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#E6DDE5] hover:bg-[#FAF8F5] text-xs font-semibold text-[#29252A] transition-all relative group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
            <p className="text-[10px] text-center text-[#8E8691] mt-1.5">
              Secure single sign-on with your Google Workspace or personal account
            </p>
          </div>

          {/* Google Sign-In Selector Modal */}
          {showGoogleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E6DDE5] space-y-5 animate-in fade-in-50 zoom-in-95">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span className="text-sm font-semibold text-[#422C42]">Sign in with Google</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="text-xs text-[#8E8691] hover:text-[#422C42]"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-[#6E6770]">
                    Select or enter the Google account you want to use for Giftora:
                  </p>

                  {/* 1-Click Option for Anubhuti */}
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn("btbtc25333_anubhuti@banasthali.in")}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[#9B668B]/40 bg-[#FAF8F5] hover:bg-[#F2E8F0] transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#422C42] text-white font-bold flex items-center justify-center text-xs shrink-0">
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#422C42] truncate">Anubhuti</p>
                      <p className="text-[11px] text-[#6E6770] truncate">btbtc25333_anubhuti@banasthali.in</p>
                    </div>
                    <span className="text-[10px] font-semibold text-[#9B668B] shrink-0">1-Click</span>
                  </button>

                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E6DDE5]" />
                    </div>
                    <div className="relative flex justify-center text-[10px]">
                      <span className="bg-white px-2 text-[#8E8691]">or use another account</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="email"
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3 py-2 text-xs text-[#29252A] focus:outline-none focus:border-[#9B668B]"
                    />
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn(googleEmailInput)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#422C42] text-white text-xs font-semibold hover:bg-[#9B668B] transition-colors"
                    >
                      Continue with this Google Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E6DDE5]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-[#8E8691]">Or sign in with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3.5 py-2.5 text-xs text-[#29252A] placeholder-[#8E8691] focus:outline-none focus:border-[#9B668B] focus:bg-white transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#422C42]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-[#9B668B] hover:text-[#422C42] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-[#29252A] placeholder-[#8E8691] focus:outline-none focus:border-[#9B668B] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8691] hover:text-[#422C42]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#9B668B] border-[#E6DDE5] rounded focus:ring-[#9B668B]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-[#6E6770]">
                Remember this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#422C42] hover:bg-[#9B668B] text-white py-3 px-4 rounded-xl text-xs font-semibold shadow-soft transition-all active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="text-center pt-2 text-xs text-[#6E6770]">
            Don&apos;t have a Giftora account yet?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#9B668B] hover:text-[#422C42] transition-colors"
            >
              Create free account
            </Link>
          </div>

        </div>

        {/* Security Assurance */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#8E8691]">
          <ShieldCheck className="w-4 h-4 text-[#9B668B]" />
          <span>Encrypted connection & respectful privacy practices</span>
        </div>
      </div>
    </div>
  );
}
