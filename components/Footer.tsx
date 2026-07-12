"use client";

import React from "react";
import Link from "next/link";

interface FooterColumn {
  title: string;
  links: { label: string; href: string; icon?: React.ReactNode }[];
}

const footerConfig: FooterColumn[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Team", href: "/team" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "For Founders", href: "/products/founders" },
      { label: "For Investors", href: "/products/investors" },
    ],
  },
  {
    title: "Social",
    links: [
      {
        label: "LinkedIn",
        href: "https://linkedin.com",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        ),
      },
      {
        label: "Instagram",
        href: "https://instagram.com",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        ),
      },
      {
        label: "X",
        href: "https://x.com",
        icon: (
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        ),
      },
    ],
  },
];

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full border-t border-border-hairline bg-background transition-colors duration-200 mt-auto">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 pt-12 pb-8 flex flex-col gap-10">
        {/* Top Grid Area */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {footerConfig.map((col) => (
            <div key={col.title} className="flex flex-col gap-3.5">
              <h3 className="text-sm font-medium text-text-primary">
                {col.title}
              </h3>
              {col.title === "Social" ? (
                <div className="flex items-center gap-4 mt-1">
                  {col.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-accent transition-colors duration-150 p-1 -m-1 focus:outline-hidden"
                      aria-label={link.label}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-text-secondary hover:text-accent hover:underline decoration-1 underline-offset-4 transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border-hairline/60 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-text-secondary font-normal">
            © {currentYear} TrustScore AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
