"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { HiTrophy, HiFire, HiSparkles, HiChevronRight } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface ModuleCompleteOverlayProps {
  moduleName: string;
  xpEarned: number;
  onContinue: () => void;
}

export function ModuleCompleteOverlay({
  moduleName,
  xpEarned,
  onContinue,
}: ModuleCompleteOverlayProps) {
  const [xpCounter, setXpCounter] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Animation sequence
  useEffect(() => {
    // Trigger confetti burst
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ["#f59e0b", "#fbbf24", "#7c3aed", "#8b5cf6", "#22c55e"],
      });
    }, 250);

    // XP counter animation
    const xpDuration = 1500;
    const xpStart = Date.now();
    const xpInterval = setInterval(() => {
      const elapsed = Date.now() - xpStart;
      const progress = Math.min(elapsed / xpDuration, 1);
      setXpCounter(Math.floor(xpEarned * progress));

      if (progress >= 1) {
        clearInterval(xpInterval);
        setShowStreak(true);
        setTimeout(() => setShowButton(true), 500);
      }
    }, 16);

    return () => {
      clearInterval(interval);
      clearInterval(xpInterval);
    };
  }, [xpEarned]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm"
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-amber-500/30"
            initial={{
              x: `${Math.random() * 100}%`,
              y: "100%",
              opacity: 0,
            }}
            animate={{
              y: "-100%",
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative text-center px-8">
        {/* Trophy icon with pulse */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-6"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl"
            />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <HiTrophy className="w-12 h-12 text-slate-900" />
            </div>
          </div>
        </motion.div>

        {/* MODULE COMPLETE text */}
        <motion.div
          initial={{ scale: 5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2,
          }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
            MODULE COMPLETE
          </h1>
          <p className="text-xl text-amber-400 font-semibold">{moduleName}</p>
        </motion.div>

        {/* XP Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 mb-6"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-900/80 border border-amber-500/30">
            <HiSparkles className="w-8 h-8 text-amber-500" />
            <div className="text-left">
              <div className="text-sm text-slate-400">Experience Earned</div>
              <div className="text-3xl font-black text-amber-400">
                +{xpCounter.toLocaleString()} XP
              </div>
            </div>
          </div>
        </motion.div>

        {/* Streak indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: showStreak ? 1 : 0,
            scale: showStreak ? 1 : 0.8,
          }}
          className="mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="inline-flex items-center gap-2 text-orange-400"
          >
            <HiFire className="w-6 h-6" />
            <span className="text-lg font-semibold">Streak Saved!</span>
            <HiFire className="w-6 h-6" />
          </motion.div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: showButton ? 1 : 0,
            y: showButton ? 0 : 20,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Button
              onClick={onContinue}
              size="lg"
              className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-8 py-6 text-lg font-bold shadow-lg shadow-amber-500/30"
            >
              Continue to Quiz
              <HiChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}





