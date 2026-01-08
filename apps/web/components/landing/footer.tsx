"use client";

import Link from "next/link";
import { motion } from "motion/react";

export function Footer() {
  return (
    <footer className="relative py-16 bg-slate-950 border-t border-slate-800/50">
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Logo */}
          <Link href="/" className="mb-8 group">
            <motion.span
              className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Kortex
            </motion.span>
          </Link>

          {/* Minimal nav */}
          <nav className="flex items-center gap-8 mb-10">
            <Link
              href="#features"
              className="text-sm text-slate-500 hover:text-amber-400 transition-colors duration-300"
            >
              Features
            </Link>
            <Link
              href="/docs"
              className="text-sm text-slate-500 hover:text-amber-400 transition-colors duration-300"
            >
              Documentation
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-slate-500 hover:text-amber-400 transition-colors duration-300"
            >
              Privacy
            </Link>
          </nav>

          {/* Divider with gradient */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mb-10" />

          {/* Creator credit */}
          <p className="text-sm text-slate-500">
            Made with ✨ by{" "}
            <a
              href="https://github.com/yash27007"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-400 hover:text-amber-300 transition-colors duration-300"
            >
              Yashwanth Aravind
            </a>
          </p>

          {/* Year */}
          <p className="mt-4 text-xs text-slate-600">
            © {new Date().getFullYear()} Kortex. All rights reserved.
          </p>

          {/* Admin Link */}
          <Link
            href="/admin/login"
            className="mt-6 text-xs text-slate-700 hover:text-amber-400 transition-colors duration-300 flex items-center gap-1"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
