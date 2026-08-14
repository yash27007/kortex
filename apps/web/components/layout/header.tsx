'use client'

import Link from "next/link"
import { Show, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-white">
              <span className="bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
                Kortex
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/courses"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Courses
                </Link>
              </Show>
              <Show when="signed-out">
                <Link
                  href="#features"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </Show>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <Link href="/sign-in">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  Get Started
                </Button>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  Dashboard
                </Button>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              />
            </Show>
          </div>
        </div>
      </div>
    </header>
  )
}
