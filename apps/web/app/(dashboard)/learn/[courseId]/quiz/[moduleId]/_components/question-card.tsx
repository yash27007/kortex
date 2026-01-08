"use client";

import { motion } from "motion/react";
import { HiCheckCircle } from "react-icons/hi2";

interface Question {
  id: string;
  text: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  explanation?: string;
}

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | undefined;
  onSelectAnswer: (answer: string) => void;
  questionNumber: number;
}

export function QuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  questionNumber,
}: QuestionCardProps) {
  const optionLabels = ["A", "B", "C", "D", "E", "F"];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
    >
      {/* Question Number Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm mb-4">
        <span className="font-medium">Question {questionNumber}</span>
        <span className="text-slate-500">•</span>
        <span className="capitalize text-slate-400">
          {question.type.replace("_", " ")}
        </span>
      </div>

      {/* Question Text */}
      <h3 className="text-xl font-semibold text-white mb-6 leading-relaxed">
        {question.text}
      </h3>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const label = optionLabels[index] || String(index + 1);

          return (
            <motion.button
              key={option}
              onClick={() => onSelectAnswer(option)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 ${isSelected
                  ? "bg-amber-500/20 border-2 border-amber-500"
                  : "bg-slate-800/50 border-2 border-transparent hover:border-slate-700 hover:bg-slate-800"
                }`}
            >
              {/* Option Label */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors ${isSelected
                  ? "bg-amber-500 text-white"
                  : "bg-slate-700 text-slate-300"
                }`}>
                {isSelected ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <HiCheckCircle className="w-6 h-6" />
                  </motion.div>
                ) : (
                  label
                )}
              </div>

              {/* Option Text */}
              <span className={`flex-1 ${isSelected ? "text-white font-medium" : "text-slate-300"
                }`}>
                {option}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}





