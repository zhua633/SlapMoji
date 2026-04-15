"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import SiteHeader from "../components/SiteHeader";

const inputClass =
  "w-full rounded-lg border border-white/55 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/35 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/35";

type AuthMode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!isSupabaseConfigured()) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      );
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Could not initialize Supabase client.");
      return;
    }

    setLoading(true);

    if (mode === "signin") {
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (signError) {
        setError(signError.message);
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setInfo(
      "Check your email to confirm your account before signing in (if confirmation is enabled in Supabase)."
    );
  };

  const tabClass = (active: boolean) =>
    [
      "flex-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
      active
        ? "text-white border-white"
        : "text-white/50 border-transparent hover:text-white/80",
    ].join(" ");

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <SiteHeader variant="login" />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex border-b border-white/20 mb-8">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={tabClass(mode === "signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={tabClass(mode === "signup")}
            >
              Create account
            </button>
          </div>

          <p className="text-white/60 text-sm mb-8">
            {mode === "signin"
              ? "Sign in with your email and password."
              : "Create an account with your email and a password."}
          </p>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-white/80 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm text-white/80 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            {info && (
              <p className="text-sm text-emerald-400/90" role="status">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-white text-black font-semibold py-3 hover:bg-white/90 disabled:opacity-50 transition-colors"
            >
              {loading
                ? mode === "signin"
                  ? "Signing in…"
                  : "Creating account…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/50">
            <Link href="/" className="text-white/70 hover:text-white">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
