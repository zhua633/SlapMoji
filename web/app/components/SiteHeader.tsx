"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const navLinkClass =
  "text-[13px] tracking-wide text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/[0.06]";

type SiteHeaderProps = {
  variant: "home" | "templates" | "login" | "edit" | "effects";
};

export default function SiteHeader({ variant }: SiteHeaderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    void supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-xl">
      <nav className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-6 py-5">
        <Link
          href="/"
          className="text-[15px] font-medium tracking-tight text-white hover:text-white/80 transition-colors"
        >
          SlapMoji
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-1">
          {!user && variant !== "login" && (
            <Link href="/login" className={navLinkClass}>
              Sign in
            </Link>
          )}
          {user && (
            <>
              <span
                className="hidden sm:inline text-[13px] text-white/40 truncate max-w-[180px] px-3"
                title={user.email ?? undefined}
              >
                {user.email}
              </span>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className={navLinkClass}
              >
                Sign out
              </button>
            </>
          )}
          {variant !== "home" && (
            <Link href="/" className={navLinkClass}>
              New project
            </Link>
          )}
          {variant !== "templates" && (
            <Link href="/templates" className={navLinkClass}>
              Gallery
            </Link>
          )}
          {variant !== "effects" && (
            <Link href="/effects" className={navLinkClass}>
              Effects
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
