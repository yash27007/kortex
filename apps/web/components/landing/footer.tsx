"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative py-12 bg-slate-950 border-t border-slate-800">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Logo */}
          <Link href="/" className="mb-6">
            <span className="text-xl font-bold text-white">Kortex</span>
          </Link>

          {/* Minimal nav */}
          <nav className="flex items-center gap-8 mb-8">
            <Link
              href="#features"
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="/docs"
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              Privacy
            </Link>
          </nav>

          {/* Divider */}
          <div className="w-16 h-px bg-slate-800 mb-8" />

          {/* Creator credit */}
          <p className="text-sm text-slate-500">
            Made by{" "}
            <a
              href="https://github.com/yash27007"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-amber-400 transition-colors"
            >
              Yashwanth Aravind
            </a>
          </p>

          {/* Copyright */}
          <p className="text-xs text-slate-600 mt-4">
            © {new Date().getFullYear()} Kortex
          </p>
        </div>
      </div>
    </footer>
  );
}
