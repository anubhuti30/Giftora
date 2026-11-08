"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useGiftora } from "@/context/GiftoraContext";

export default function SignupPage() {
  const router = useRouter();
  const { signupUser } = useGiftora();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleOauthNotice, setGoogleOauthNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password should be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (!acceptTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsLoading(true);
    try {
      await signupUser(name.trim(), email.trim(), password);
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/discover");
      }, 1200);
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "Account registration failed. Please try again.";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
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
          Create your Giftora account
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#6E6770]">
          Start discovering gifts your loved ones will remember for years.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-card border border-[#E6DDE5] space-y-6">
          
          {success ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#422C42]">
                Account created successfully!
              </h2>
              <p className="text-xs text-[#6E6770]">
                Redirecting you to the AI Gift Discovery workspace...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                  {error}
                </div>
              )}

              {/* Google Signup Button */}
              <div>
                <button
                  type="button"
                  onClick={() => setGoogleOauthNotice(true)}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#E6DDE5] hover:bg-[#FAF8F5] text-xs font-semibold text-[#29252A] transition-all"
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
                  <span>Sign up with Google</span>
                </button>
                <p className="text-[10px] text-center text-[#8E8691] mt-1.5">
                  Single sign-on using your existing Google account
                </p>
              </div>

              {/* Google OAuth Modal */}
              {googleOauthNotice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E6DDE5] space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F2E8F0] text-[#9B668B] flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-serif text-lg font-bold text-[#422C42]">
                        Google Single Sign-On Setup
                      </h3>
                      <p className="text-xs text-[#6E6770] leading-relaxed">
                        Google OAuth client credentials are configured in production via <code className="bg-[#FAF8F5] px-1.5 py-0.5 rounded text-[11px] font-mono text-[#422C42]">GOOGLE_CLIENT_ID</code>.
                      </p>
                      <p className="text-xs text-[#6E6770] leading-relaxed">
                        To sign up immediately, please fill in your name, email and password below.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGoogleOauthNotice(false)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#422C42] text-white text-xs font-semibold hover:bg-[#9B668B] transition-colors"
                    >
                      Continue with Email Registration
                    </button>
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E6DDE5]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-[#8E8691]">Or register with email</span>
                </div>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Priya Nair"
                    className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3.5 py-2.5 text-xs text-[#29252A] placeholder-[#8E8691] focus:outline-none focus:border-[#9B668B] focus:bg-white transition-all"
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
                    required
                    placeholder="name@example.com"
                    className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3.5 py-2.5 text-xs text-[#29252A] placeholder-[#8E8691] focus:outline-none focus:border-[#9B668B] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                    Password (8+ characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Create a strong password"
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

                <div>
                  <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-type your password"
                    className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3.5 py-2.5 text-xs text-[#29252A] placeholder-[#8E8691] focus:outline-none focus:border-[#9B668B] focus:bg-white transition-all"
                  />
                </div>

                {/* Terms and Privacy Checkbox */}
                <div className="flex items-start">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#9B668B] border-[#E6DDE5] rounded focus:ring-[#9B668B]"
                  />
                  <label htmlFor="terms" className="ml-2 block text-xs text-[#6E6770] leading-snug">
                    I agree to Giftora&apos;s Terms of Service and acknowledge the Privacy Policy.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#422C42] hover:bg-[#9B668B] text-white py-3 px-4 rounded-xl text-xs font-semibold shadow-soft transition-all active:scale-95 disabled:opacity-70"
                >
                  {isLoading ? (
                    <span>Creating your account...</span>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Link to Login */}
              <div className="text-center pt-2 text-xs text-[#6E6770]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#9B668B] hover:text-[#422C42] transition-colors"
                >
                  Sign in instead
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
