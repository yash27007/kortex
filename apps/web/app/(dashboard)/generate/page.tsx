"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HiSparkles, HiArrowLeft } from "react-icons/hi2";
import Link from "next/link";

import {
  CourseForm,
  ProgressVisualization,
  CoursePreview,
  type CourseFormData,
} from "@/components/generate";
import { useCourseGeneration } from "@/hooks/use-course-generation";

type ViewState = "form" | "generating" | "preview";

export default function GeneratePage() {
  const [view, setView] = useState<ViewState>("form");
  const { steps, course, error, isGenerating, progress, generate, reset } =
    useCourseGeneration();

  const handleSubmit = (data: CourseFormData) => {
    setView("generating");
    generate(data);
  };

  const handleReset = () => {
    reset();
    setView("form");
  };

  // Switch to preview when generation is complete
  if (course && view === "generating") {
    setView("preview");
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <AnimatePresence mode="wait">
            {view === "form" && (
              <motion.div
                key="form-header"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                  <HiSparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-amber-300 font-medium">
                    AI Course Generator
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Create Your Course
                </h1>
                <p className="text-slate-400 max-w-lg mx-auto">
                  Describe your course and let AI generate a complete curriculum
                  with Bloom&apos;s Taxonomy progression.
                </p>
              </motion.div>
            )}

            {view === "generating" && (
              <motion.div
                key="generating-header"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Generating Your Course
                </h1>
                <p className="text-slate-400">
                  Our AI is crafting a personalized curriculum just for you...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {view === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CourseForm onSubmit={handleSubmit} isLoading={isGenerating} />
            </motion.div>
          )}

          {view === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProgressVisualization steps={steps} overallProgress={progress} />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center"
                >
                  <p className="text-red-400 font-medium mb-2">
                    Generation Failed
                  </p>
                  <p className="text-red-400/70 text-sm mb-4">{error}</p>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {view === "preview" && course && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CoursePreview
                course={course}
                onEdit={handleReset}
                onSave={() => {
                  // TODO: Save course to database
                  alert("Course saving will be implemented with database integration!");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}








