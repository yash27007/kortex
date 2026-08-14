"use client";

import { useState, use } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { CourseSidebar } from "./_components/course-sidebar";
import { GamificationHUD } from "./_components/gamification-hud";

interface CourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}

export default function CourseLayout({ children, params }: CourseLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { courseId } = use(params);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            // top-16/h-[calc(100vh-4rem)] offsets for the global fixed
            // Navbar (h-16) from the root layout, which this route doesn't
            // otherwise account for — without it, the sidebar header sits
            // underneath the navbar instead of below it.
            className="relative h-[calc(100vh-4rem)] sticky top-16 overflow-hidden"
          >
            <CourseSidebar courseId={courseId} onClose={() => setSidebarOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed z-50 top-1/2 -translate-y-1/2 ${sidebarOpen ? "left-[308px]" : "left-0"
          } p-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-r-lg transition-all duration-300 hover:bg-slate-800 group`}
      >
        {sidebarOpen ? (
          <HiChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
        ) : (
          <HiChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
        )}
      </button>

      {/* Main Content */}
      {/* pt-16 clears the global fixed Navbar (h-16) — same reason as the
          sidebar's top-16/h-[calc(100vh-4rem)] above. */}
      <main className="flex-1 min-h-screen relative pt-16">
        {/* Gamification HUD (top-right) */}
        <GamificationHUD />

        {/* Page Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
        </div>
      </main>
    </div>
  );
}





