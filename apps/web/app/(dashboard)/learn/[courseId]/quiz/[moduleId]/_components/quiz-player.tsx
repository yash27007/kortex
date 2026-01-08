"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HiChevronLeft, HiChevronRight, HiClock } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "./question-card";

interface Question {
  id: string;
  text: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  explanation?: string;
}

interface QuizPlayerProps {
  quiz: {
    id: string;
    questions: unknown;
    timeLimit: number | null;
  };
  onSubmit: (answers: Record<string, string>) => void;
  isSubmitting: boolean;
}

export function QuizPlayer({ quiz, onSubmit, isSubmitting }: QuizPlayerProps) {
  const questions = quiz.questions as Question[];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );

  const currentQuestion = questions[currentIndex];
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  // Guard for undefined question
  if (!currentQuestion) {
    return null;
  }

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          onSubmit(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, answers, onSubmit]);

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Progress & Timer */}
      <div className="flex items-center justify-between">
        {/* Progress bar */}
        <div className="flex-1 mr-4">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{answeredCount} answered</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Timer */}
        {timeRemaining !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 60 ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-white"
            }`}>
            <HiClock className="w-5 h-5" />
            <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Question Navigator (dots) */}
      <div className="flex items-center justify-center gap-2">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
              ? "bg-amber-500 scale-125"
              : answers[q.id]
                ? "bg-emerald-500"
                : "bg-slate-700 hover:bg-slate-600"
              }`}
          />
        ))}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          selectedAnswer={answers[currentQuestion.id]}
          onSelectAnswer={(answer) => handleSelectAnswer(currentQuestion.id, answer)}
          questionNumber={currentIndex + 1}
        />
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          className="gap-2"
        >
          <HiChevronLeft className="w-5 h-5" />
          Previous
        </Button>

        {isLastQuestion ? (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 px-8"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Quiz
                  <span className="text-lg">✓</span>
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <Button
            onClick={handleNext}
            className="gap-2"
          >
            Next
            <HiChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Answer count reminder */}
      {!allAnswered && (
        <p className="text-center text-sm text-slate-500">
          {questions.length - answeredCount} question(s) remaining
        </p>
      )}
    </motion.div>
  );
}





