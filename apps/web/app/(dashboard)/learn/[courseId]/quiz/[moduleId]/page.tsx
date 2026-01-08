"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { HiArrowLeft, HiClock, HiTrophy } from "react-icons/hi2";
import Link from "next/link";
import { useTRPC, useQuery, useMutation } from "@/server/trpc/client";
import { QuizPlayer } from "./_components/quiz-player";
import { QuizResults } from "./_components/quiz-results";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface QuizPageProps {
  params: Promise<{ courseId: string; moduleId: string }>;
}

type QuizState = "intro" | "playing" | "results";

export default function QuizPage({ params }: QuizPageProps) {
  const { courseId, moduleId } = use(params);
  const router = useRouter();
  const api = useTRPC();
  const [quizState, setQuizState] = useState<QuizState>("intro");
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Fetch quiz data
  const { data: quiz, isLoading } = useQuery(api.quiz.getByModuleId.queryOptions(
    { moduleId },
    { staleTime: 1000 * 60 * 5 }
  ));

  // Fetch module info
  const { data: module } = useQuery(api.quiz.getModuleInfo.queryOptions(
    { moduleId },
    { staleTime: 1000 * 60 * 5 }
  ));

  // Submit quiz mutation
  const submitQuiz = useMutation(api.quiz.submit.mutationOptions({
    onSuccess: (data) => {
      setScore(data.score);
      setQuizState("results");
    },
  }));

  const handleStartQuiz = () => {
    setQuizState("playing");
  };

  const handleSubmitQuiz = (userAnswers: Record<string, string>) => {
    setAnswers(userAnswers);
    submitQuiz.mutate({
      quizId: quiz!.id,
      answers: userAnswers,
    });
  };

  const handleContinue = () => {
    // Navigate to next module's first lesson or course complete
    router.push(`/learn/${courseId}`);
  };

  const handleRetry = () => {
    setQuizState("intro");
    setScore(0);
    setAnswers({});
  };

  if (isLoading) {
    return <QuizSkeleton />;
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Quiz not found</h2>
          <Link href={`/learn/${courseId}`} className="text-amber-400 hover:underline">
            Return to course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-8">
          <Link
            href={`/learn/${courseId}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to course
          </Link>
          <h1 className="text-2xl font-bold text-white">{module?.title}</h1>
          <p className="text-slate-400 mt-1">{quiz.title}</p>
        </header>

        {/* Quiz States */}
        <AnimatePresence mode="wait">
          {quizState === "intro" && (
            <QuizIntro
              key="intro"
              quiz={quiz}
              onStart={handleStartQuiz}
            />
          )}

          {quizState === "playing" && (
            <QuizPlayer
              key="playing"
              quiz={quiz}
              onSubmit={handleSubmitQuiz}
              isSubmitting={submitQuiz.isPending}
            />
          )}

          {quizState === "results" && (
            <QuizResults
              key="results"
              quiz={quiz}
              score={score}
              answers={answers}
              passed={score >= quiz.passingScore}
              xpEarned={score >= quiz.passingScore ? quiz.xpReward : 0}
              onContinue={handleContinue}
              onRetry={handleRetry}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface QuizIntroProps {
  quiz: {
    title: string;
    description: string | null;
    passingScore: number;
    timeLimit: number | null;
    xpReward: number;
    questions: unknown[];
  };
  onStart: () => void;
}

function QuizIntro({ quiz, onStart }: QuizIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
    >
      {/* Boss Fight Header */}
      <div className="text-center mb-8">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20 border-2 border-amber-500/50 mb-4"
        >
          <span className="text-4xl">⚔️</span>
        </motion.div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent">
          Module Assessment
        </h2>
        <p className="text-slate-400 mt-2">
          Complete this quiz to unlock the next module
        </p>
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {Array.isArray(quiz.questions) ? quiz.questions.length : 0}
          </div>
          <div className="text-sm text-slate-400">Questions</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{quiz.passingScore}%</div>
          <div className="text-sm text-slate-400">To Pass</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <HiTrophy className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-bold text-white">{quiz.xpReward}</span>
          </div>
          <div className="text-sm text-slate-400">XP Reward</div>
        </div>
      </div>

      {/* Time limit warning */}
      {quiz.timeLimit && (
        <div className="flex items-center justify-center gap-2 text-amber-400 mb-6">
          <HiClock className="w-5 h-5" />
          <span>Time Limit: {quiz.timeLimit} minutes</span>
        </div>
      )}

      {/* Start Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={onStart}
          size="lg"
          className="w-full gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold py-6 text-lg"
        >
          Begin Assessment
          <span className="text-xl">→</span>
        </Button>
      </motion.div>

      {quiz.description && (
        <p className="text-sm text-slate-500 text-center mt-4">
          {quiz.description}
        </p>
      )}
    </motion.div>
  );
}

function QuizSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-3xl px-6">
        <Skeleton className="h-8 w-32 bg-slate-800 mb-4" />
        <Skeleton className="h-12 w-64 bg-slate-800 mb-8" />
        <Skeleton className="h-96 w-full bg-slate-800 rounded-2xl" />
      </div>
    </div>
  );
}





