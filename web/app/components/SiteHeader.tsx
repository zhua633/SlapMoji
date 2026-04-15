"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const linkClass =
  "text-sm text-white/70 hover:text-white transition-colors px-2 py-2 rounded-md hover:bg-white/5";

type SiteHeaderProps = {
  variant: "home" | "templates" | "login" | "edit";
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
    <header className="sticky top-0 z-30 shrink-0 border-b border-white/10 bg-black/90 backdrop-blur-md">
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 sm:px-6 py-4 sm:py-5">
        {!user && variant !== "login" && (
          <Link href="/login" className={linkClass}>
            Sign in
          </Link>
        )}
        {user && (
          <>
            <span
              className="text-sm text-white/55 truncate max-w-[200px] px-2 py-2"
              title={user.email ?? undefined}
            >
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className={linkClass}
            >
              Sign out
            </button>
          </>
        )}
        {variant === "templates" ? (
          <Link href="/" className={linkClass}>
            Home
          </Link>
        ) : variant === "login" || variant === "edit" ? (
          <>
            <Link href="/" className={linkClass}>
              Home
            </Link>
            <Link href="/templates" className={linkClass}>
              Templates
            </Link>
          </>
        ) : (
          <Link href="/templates" className={linkClass}>
            Templates
          </Link>
        )}
      </nav>
    </header>
  );
}
