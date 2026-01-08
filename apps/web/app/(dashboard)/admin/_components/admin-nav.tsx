"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { HiShieldCheck, HiUsers, HiBookOpen, HiChartBar, HiCog, HiArrowRightOnRectangle } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AdminNav() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Logged out successfully");
        router.push("/admin/login");
        router.refresh();
      } else {
        toast.error("Failed to logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred");
    }
  };

  return (
    <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <HiShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Kortex Admin</span>
          </Link>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Users
            </Link>
            <Link
              href="/admin/courses"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/admin/analytics"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Analytics
            </Link>
            <Link
              href="/admin/settings"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Settings
            </Link>
          </div>

          {/* Right: Logout Button */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <HiArrowRightOnRectangle className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}




