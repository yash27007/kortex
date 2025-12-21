"use client";

import Link from "next/link";
import { motion } from "motion/react";

export function Footer() {
  return (
    <footer className="relative py-12 bg-gray-950 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Logo */}
          <Link href="/" className="mb-6">
            <span className="text-xl font-bold text-white">Kortex</span>
          </Link>

          {/* Minimal nav */}
          <nav className="flex items-center gap-8 mb-8">
            <Link
              href="#features"
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="/about"
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Privacy
            </Link>
          </nav>

          {/* Divider */}
          <div className="w-16 h-px bg-white/10 mb-8" />

          {/* Creator credit */}
          <motion.p
            className="text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Made by{" "}
            <a
              href="https://github.com/yash27007"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-violet-400 transition-colors"
            >
              Yashwanth Aravind
            </a>
          </motion.p>

          {/* Copyright */}
          <p className="text-xs text-gray-600 mt-4">
            © {new Date().getFullYear()} Kortex
          </p>
        </div>
      </div>
    </footer>
  );
}
