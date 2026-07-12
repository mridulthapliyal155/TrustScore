"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface DropdownItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  dropdownItems?: DropdownItem[];
}

export interface NavbarProps {
  isLoggedIn?: boolean;
  onAuthToggle?: () => void;
  // External control for preview mode
  productsOpenOverride?: boolean;
  profileOpenOverride?: boolean;
  onProductsOpenChange?: (open: boolean) => void;
  onProfileOpenChange?: (open: boolean) => void;
}

const navConfig: NavItem[] = [
  {
    label: "Products",
    dropdownItems: [
      { label: "For Founders", href: "/products/founders" },
      { label: "For Investors", href: "/products/investors" },
    ],
  },
  {
    label: "How It Works",
    href: "/how-it-works",
  },
];

export default function Navbar({
  isLoggedIn: externalIsLoggedIn,
  onAuthToggle,
  productsOpenOverride,
  profileOpenOverride,
  onProductsOpenChange,
  onProfileOpenChange,
}: NavbarProps) {
  // Authentication status
  const [internalIsLoggedIn, setInternalIsLoggedIn] = useState(false);
  const isLoggedIn = externalIsLoggedIn !== undefined ? externalIsLoggedIn : internalIsLoggedIn;

  // Products dropdown state
  const [internalProductsOpen, setInternalProductsOpen] = useState(false);
  const isProductsOpen = productsOpenOverride !== undefined ? productsOpenOverride : internalProductsOpen;
  
  const setProductsOpen = useCallback((open: boolean) => {
    console.log("Navbar: setProductsOpen called with:", open);
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
    console.log("Navbar: setProfileOpen called with:", open);
    if (onProfileOpenChange) {
      onProfileOpenChange(open);
    } else {
      setInternalProfileOpen(open);
    }
  }, [onProfileOpenChange]);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Refs for closing dropdowns on click outside
  const productsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (productsRef.current) {
        const isInside = productsRef.current.contains(event.target as Node);
        console.log("Navbar: handleClickOutside productsRef, isInside:", isInside);
        if (!isInside) {
          setProductsOpen(false);
        }
      }
      if (profileRef.current) {
        const isInside = profileRef.current.contains(event.target as Node);
        console.log("Navbar: handleClickOutside profileRef, isInside:", isInside);
        if (!isInside) {
          setProfileOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setProductsOpen, setProfileOpen]);

  const handleLoginClick = () => {
    console.log("Navbar: handleLoginClick triggered, onAuthToggle exists:", !!onAuthToggle);
    if (onAuthToggle) {
      onAuthToggle();
    } else {
      setInternalIsLoggedIn(true);
    }
  };

  const handleLogoutClick = () => {
    console.log("Navbar: handleLogoutClick triggered, onAuthToggle exists:", !!onAuthToggle);
    if (onAuthToggle) {
      onAuthToggle();
    } else {
      setInternalIsLoggedIn(false);
    }
    setProfileOpen(false);
  };

  console.log("Navbar Render states:", {
    isLoggedIn,
    isProductsOpen,
    isProfileOpen,
    productsOpenOverride,
    profileOpenOverride,
    internalProductsOpen,
    internalProfileOpen
  });

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
            {navConfig.map((item) => (
              <div key={item.label} className="relative">
                {item.dropdownItems ? (
                  <div ref={productsRef} className="relative">
                    <button
                      onClick={() => setProductsOpen(!isProductsOpen)}
                      className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer py-1.5 focus:outline-hidden"
                      aria-expanded={isProductsOpen}
                      aria-haspopup="true"
                    >
                      <span>{item.label}</span>
                      <svg
                        className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 ${
                          isProductsOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Products Dropdown menu */}
                    {isProductsOpen && (
                      <div className="absolute left-0 mt-2 w-48 bg-surface border border-border-hairline rounded-card p-1.5 shadow-xs focus:outline-hidden animate-in fade-in slide-in-from-top-1 duration-100 z-50">
                        {item.dropdownItems.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            onClick={() => setProductsOpen(false)}
                            className="block px-3.5 py-2 text-sm text-text-primary hover:bg-background rounded-button transition-colors duration-150"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors py-1.5 focus:outline-hidden"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Auth elements (Desktop) */}
        <div className="hidden md:flex items-center gap-5">
          {!isLoggedIn ? (
            <>
              <button
                onClick={handleLoginClick}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer py-1.5 focus:outline-hidden"
              >
                Log In
              </button>
              <button
                onClick={handleLoginClick}
                className="bg-accent text-surface px-4 py-2 text-sm font-medium rounded-button hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer focus:outline-hidden"
              >
                Register
              </button>
            </>
          ) : (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!isProfileOpen)}
                className="w-9 h-9 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center hover:bg-accent/15 transition-all cursor-pointer focus:outline-hidden select-none"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <span className="text-sm font-medium text-accent">AR</span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface border border-border-hairline rounded-card p-3 shadow-xs animate-in fade-in slide-in-from-top-1 duration-100 z-50">
                  {/* User Profile Header */}
                  <div className="px-2 pb-2.5 mb-2 border-b border-border-hairline">
                    <p className="text-sm font-medium text-text-primary">Alex Rivera</p>
                    <p className="text-xs text-text-secondary truncate mt-0.5">alex.rivera@example.com</p>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="space-y-0.5">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block px-2 py-1.5 text-sm text-text-primary hover:bg-background rounded-button transition-colors"
                    >
                      My Startup Details
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setProfileOpen(false)}
                      className="block px-2 py-1.5 text-sm text-text-primary hover:bg-background rounded-button transition-colors"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-2 py-1.5 text-sm text-text-primary hover:bg-background rounded-button transition-colors cursor-pointer focus:outline-hidden"
                    >
                      Log Out
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
          {isLoggedIn && (
            <button
              onClick={() => {
                setMobileMenuOpen(true);
                setProfileOpen(true);
              }}
              className="w-8 h-8 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center focus:outline-hidden"
            >
              <span className="text-xs font-medium text-accent">AR</span>
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
            {navConfig.map((item) => (
              <div key={item.label} className="space-y-1">
                {item.dropdownItems ? (
                  <>
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider px-2">
                      {item.label}
                    </p>
                    <div className="pl-4 space-y-2 border-l border-border-hairline mt-1">
                      {item.dropdownItems.map((subItem) => (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1 text-sm font-medium text-text-primary hover:text-accent transition-colors"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href || "#"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 px-2 text-sm font-medium text-text-primary hover:text-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border-hairline pt-4 space-y-3">
            {/* Auth section */}
            {!isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleLoginClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-sm font-medium text-text-primary border border-border-hairline rounded-button bg-background cursor-pointer focus:outline-hidden"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    handleLoginClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-sm font-medium text-surface bg-accent rounded-button cursor-pointer focus:outline-hidden"
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <p className="text-xs text-text-secondary">Logged in as</p>
                  <p className="text-sm font-medium text-text-primary">Alex Rivera (alex.rivera@example.com)</p>
                </div>
                <div className="space-y-1 pl-2">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-sm font-medium text-text-primary hover:text-accent transition-colors"
                  >
                    My Startup Details
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-sm font-medium text-text-primary hover:text-accent transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogoutClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-1.5 text-sm font-medium text-text-primary hover:text-accent transition-colors cursor-pointer focus:outline-hidden"
                  >
                    Log Out
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
