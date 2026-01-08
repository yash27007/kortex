"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  HiTrophy,
  HiXCircle,
  HiCheckCircle,
  HiArrowPath,
  HiChevronRight,
} from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuizResultsProps {
  quiz: {
    questions: unknown;
    xpReward: number;
    passingScore: number;
  };
  score: number;
  answers: Record<string, string>;
  passed: boolean;
  xpEarned: number;
  onContinue: () => void;
  onRetry: () => void;
}

export function QuizResults({
  quiz,
  score,
  answers,
  passed,
  xpEarned,
  onContinue,
  onRetry,
}: QuizResultsProps) {
  const [showScore, setShowScore] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const questions = quiz.questions as Question[];

  // Animate score counter
  useEffect(() => {
    if (!showScore) {
      const timer = setTimeout(() => setShowScore(true), 500);
      return () => clearTimeout(timer);
    }

    const duration = 1500;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setAnimatedScore(Math.floor(score * progress));

      if (progress >= 1) {
        clearInterval(interval);
        // Trigger confetti if passed
        if (passed) {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.4 },
            colors: ["#f59e0b", "#fbbf24", "#22c55e", "#4ade80"],
          });
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, [showScore, score, passed]);

  const correctCount = Object.entries(answers).filter(([questionId, answer]) => {
    const question = questions.find((q) => q.id === questionId);
    return question?.correctAnswer === answer;
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="space-y-8"
    >
      {/* Result Card */}
      <div className={`relative overflow-hidden rounded-2xl p-8 ${passed
          ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30"
          : "bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30"
        }`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="mb-6"
          >
            {passed ? (
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50">
                <HiTrophy className="w-12 h-12 text-emerald-400" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500/50">
                <HiXCircle className="w-12 h-12 text-red-400" />
              </div>
            )}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-3xl font-bold mb-2 ${passed ? "text-emerald-400" : "text-red-400"
              }`}
          >
            {passed ? "Congratulations!" : "Almost There!"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400"
          >
            {passed
              ? "You've mastered this module!"
              : `You need ${quiz.passingScore}% to pass. Try again!`}
          </motion.p>

          {/* Score */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showScore ? 1 : 0 }}
            className="mt-8"
          >
            <div className="text-6xl font-black text-white mb-2">
              {animatedScore}%
            </div>
            <div className="text-slate-400">
              {correctCount} of {questions.length} correct
            </div>
          </motion.div>

          {/* XP Earned */}
          {passed && xpEarned > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-400"
            >
              <HiTrophy className="w-5 h-5" />
              <span className="font-bold">+{xpEarned} XP Earned!</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Question Review */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Question Review</h3>
        <div className="space-y-3">
          {questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <div
                key={question.id}
                className={`flex items-start gap-3 p-4 rounded-xl ${isCorrect ? "bg-emerald-500/10" : "bg-red-500/10"
                  }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? "bg-emerald-500/20" : "bg-red-500/20"
                  }`}>
                  {isCorrect ? (
                    <HiCheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <HiXCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 font-medium line-clamp-1">
                    Q{index + 1}: {question.text}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className={isCorrect ? "text-emerald-400" : "text-red-400"}>
                      Your answer: {userAnswer || "Not answered"}
                    </span>
                    {!isCorrect && (
                      <>
                        <span className="text-slate-500">•</span>
                        <span className="text-emerald-400">
                          Correct: {question.correctAnswer}
                        </span>
                      </>
                    )}
                  </div>
                  {question.explanation && !isCorrect && (
                    <p className="text-xs text-slate-500 mt-1">
                      💡 {question.explanation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        {!passed && (
          <Button
            variant="outline"
            onClick={onRetry}
            className="gap-2"
          >
            <HiArrowPath className="w-5 h-5" />
            Try Again
          </Button>
        )}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onContinue}
            className={`gap-2 px-8 ${passed
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500"
                : "bg-slate-700 hover:bg-slate-600"
              }`}
          >
            {passed ? "Continue to Next Module" : "Return to Course"}
            <HiChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}





