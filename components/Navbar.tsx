"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface NavItem {
  label: string;
  href: string;
}

export interface NavbarProps {
  // Gracefully accept props from earlier mock usage, but override with real auth state
  isLoggedIn?: boolean;
  onAuthToggle?: () => void;
  productsOpenOverride?: boolean;
  profileOpenOverride?: boolean;
  onProductsOpenChange?: (open: boolean) => void;
  onProfileOpenChange?: (open: boolean) => void;
}

export default function Navbar({
  productsOpenOverride,
  profileOpenOverride,
  onProductsOpenChange,
  onProfileOpenChange,
}: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Products dropdown state
  const [internalProductsOpen, setInternalProductsOpen] = useState(false);
  const isProductsOpen = productsOpenOverride !== undefined ? productsOpenOverride : internalProductsOpen;
  
  const setProductsOpen = useCallback((open: boolean) => {
    if (onProductsOpenChange) {
      onProductsOpenChange(open);
    } else {
      setInternalProductsOpen(open);
    }
  }, [onProductsOpenChange]);

  // Profile dropdown state
  const [internalProfileOpen, setInternalProfileOpen] = useState(false);
  const isProfileOpen = profileOpenOverride !== undefined ? profileOpenOverride : internalProfileOpen;
  
  const setProfileOpen = useCallback((open: boolean) => {
    if (onProfileOpenChange) {
      onProfileOpenChange(open);
    } else {
      setInternalProfileOpen(open);
    }
  }, [onProfileOpenChange]);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Listen to Supabase Auth changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target && target.closest && target.closest(".preview-control")) {
        return;
      }
      setProductsOpen(false);
      setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setProductsOpen, setProfileOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfileOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const isLoggedIn = user !== null;
  const userRole = user?.user_metadata?.role || user?.user_metadata?.user_type || "";
  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "US";

  // Dynamic Navigation Config based on User State and Role (in sentence case)
  const getNavLinks = (): NavItem[] => {
    if (!isLoggedIn) {
      return [
        { label: "About", href: "/about" },
        { label: "How it works", href: "/how-it-works" },
      ];
    }
    if (userRole === "founder") {
      return [
        { label: "Onboard your company", href: "/register" },
        { label: "About", href: "/about" },
        { label: "How it works", href: "/how-it-works" },
      ];
    }
    if (userRole === "investor") {
      return [
        { label: "Directory", href: "/directory" },
        { label: "About", href: "/about" },
        { label: "How it works", href: "/how-it-works" },
      ];
    }
    return [
      { label: "About", href: "/about" },
      { label: "How it works", href: "/how-it-works" },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="w-full border-b border-border-hairline bg-surface sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Left: Logo & Nav items */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group focus:outline-hidden">
            <svg
              className="w-6 h-6 text-accent transition-transform duration-200 group-hover:scale-105"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 11 2 2 4-4" />
            </svg>
            <span className="font-medium text-text-primary text-lg tracking-tight hover:text-accent transition-colors duration-150">
              TrustScore AI
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors py-1.5 focus:outline-hidden"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Auth elements (Desktop) */}
        <div className="hidden md:flex items-center gap-5">
          {loading ? (
            <div className="h-9 w-20 bg-neutral-100 animate-pulse rounded-button"></div>
          ) : !isLoggedIn ? (
            <>
              <Link
                href="/auth?mode=signin"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors py-1.5 focus:outline-hidden"
              >
                Sign in
              </Link>
              <Link
                href="/auth?mode=signup"
                className="bg-accent text-surface px-4 py-2 text-sm font-medium rounded-button hover:bg-opacity-90 active:scale-98 transition-all focus:outline-hidden"
              >
                Get started
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => {
                  setProfileOpen(!isProfileOpen);
                  setProductsOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center hover:bg-accent/15 transition-all cursor-pointer focus:outline-hidden select-none"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <span className="text-sm font-medium text-accent">{userInitials}</span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-64 bg-surface border border-border-hairline rounded-card p-3 shadow-xs animate-in fade-in slide-in-from-top-1 duration-100 z-50"
                >
                  {/* User Profile Header */}
                  <div className="px-2 pb-2.5 mb-2 border-b border-border-hairline">
                    <p className="text-sm font-medium text-text-primary truncate">{user.email}</p>
                    <p className="text-xs text-text-secondary capitalize mt-0.5">{userRole}</p>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="space-y-0.5">
                    {userRole === "founder" && (
                      <Link
                        href="/dashboard"
                        onClick={() => setTimeout(() => setProfileOpen(false), 0)}
                        className="block px-2 py-1.5 text-sm text-text-primary hover:bg-background rounded-button transition-colors"
                      >
                        Dashboard
                      </Link>
                    )}
                    {userRole === "founder" && (
                      <Link
                        href="/register"
                        onClick={() => setTimeout(() => setProfileOpen(false), 0)}
                        className="block px-2 py-1.5 text-sm text-text-primary hover:bg-background rounded-button transition-colors"
                      >
                        Onboard your company
                      </Link>
                    )}
                    {userRole === "investor" && (
                      <Link
                        href="/directory"
                        onClick={() => setTimeout(() => setProfileOpen(false), 0)}
                        className="block px-2 py-1.5 text-sm text-text-primary hover:bg-background rounded-button transition-colors"
                      >
                        Directory
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-2 py-1.5 text-sm text-text-primary hover:bg-background rounded-button transition-colors cursor-pointer focus:outline-hidden"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          {/* If logged in on mobile, show quick avatar beside hamburger */}
          {isLoggedIn && !loading && (
            <button
              onClick={() => {
                setMobileMenuOpen(true);
                setProfileOpen(true);
              }}
              className="w-8 h-8 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center focus:outline-hidden"
            >
              <span className="text-xs font-medium text-accent">{userInitials}</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 -mr-1.5 text-text-secondary hover:text-text-primary cursor-pointer focus:outline-hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer/Menu Content */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-hairline bg-surface px-4 py-4 space-y-4 animate-in slide-in-from-top duration-200">
          {/* Nav Config Items */}
          <div className="space-y-3">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 px-2 text-sm font-medium text-text-primary hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-border-hairline pt-4 space-y-3">
            {/* Auth section */}
            {loading ? (
              <div className="h-9 w-20 bg-neutral-100 animate-pulse rounded-button"></div>
            ) : !isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth?mode=signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-text-primary border border-border-hairline rounded-button bg-background"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth?mode=signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-surface bg-accent rounded-button"
                >
                  Get started
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <p className="text-xs text-text-secondary">Signed in as</p>
                  <p className="text-sm font-medium text-text-primary truncate">{user.email}</p>
                </div>
                <div className="space-y-1 pl-2">
                  {userRole === "founder" && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-sm font-medium text-text-primary hover:text-accent transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  {userRole === "founder" && (
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-sm font-medium text-text-primary hover:text-accent transition-colors"
                    >
                      Onboard your company
                    </Link>
                  )}
                  {userRole === "investor" && (
                    <Link
                      href="/directory"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-sm font-medium text-text-primary hover:text-accent transition-colors"
                    >
                      Directory
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left py-1.5 text-sm font-medium text-text-primary hover:text-accent transition-colors cursor-pointer focus:outline-hidden"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
