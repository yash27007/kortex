"use client";

import { motion } from "motion/react";
import { HiClock, HiAcademicCap, HiBookOpen, HiCheck } from "react-icons/hi2";

interface Lesson {
  title: string;
  description: string;
  bloom_level: string;
  duration_minutes: number;
  content_outline: string[];
  key_concepts: string[];
}

interface Module {
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  title: string;
  description: string;
  difficulty: string;
  estimated_duration_hours: number;
  learning_objectives: string[];
  modules: Module[];
  prerequisites: string[];
  target_audience: string;
}

interface CoursePreviewProps {
  course: Course;
  onSave?: () => void;
  onEdit?: () => void;
}

const bloomColors: Record<string, string> = {
  remember: "bg-slate-600",
  understand: "bg-blue-600",
  apply: "bg-green-600",
  analyze: "bg-yellow-600",
  evaluate: "bg-orange-600",
  create: "bg-amber-500",
};

export function CoursePreview({ course, onSave, onEdit }: CoursePreviewProps) {
  const totalLessons = course.modules.reduce(
    (acc, mod) => acc + mod.lessons.length,
    0
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
          <HiCheck className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400 font-medium">
            Course Generated Successfully
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          {course.title}
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">{course.description}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
          <HiClock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">
            {course.estimated_duration_hours}h
          </p>
          <p className="text-sm text-slate-400">Duration</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
          <HiBookOpen className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{course.modules.length}</p>
          <p className="text-sm text-slate-400">Modules</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
          <HiAcademicCap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{totalLessons}</p>
          <p className="text-sm text-slate-400">Lessons</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
          <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center">
            <span className="text-lg">📊</span>
          </div>
          <p className="text-2xl font-bold text-white capitalize">
            {course.difficulty}
          </p>
          <p className="text-sm text-slate-400">Level</p>
        </div>
      </motion.div>

      {/* Learning Objectives */}
      {course.learning_objectives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-6 rounded-xl bg-slate-800/30 border border-slate-700/50"
        >
          <h2 className="text-lg font-semibold text-white mb-4">
            Learning Objectives
          </h2>
          <ul className="space-y-2">
            {course.learning_objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-slate-300">{objective}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Modules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Course Modules</h2>
        {course.modules.map((module, moduleIndex) => (
          <motion.div
            key={moduleIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + moduleIndex * 0.1 }}
            className="rounded-xl bg-slate-800/30 border border-slate-700/50 overflow-hidden"
          >
            {/* Module header */}
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500 text-slate-900 font-bold text-sm flex items-center justify-center">
                  {module.order}
                </span>
                <div>
                  <h3 className="font-semibold text-white">{module.title}</h3>
                  <p className="text-sm text-slate-400">{module.description}</p>
                </div>
              </div>
            </div>

            {/* Lessons */}
            <div className="divide-y divide-slate-700/30">
              {module.lessons.map((lesson, lessonIndex) => (
                <div
                  key={lessonIndex}
                  className="p-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium text-white ${bloomColors[lesson.bloom_level] || "bg-slate-600"}`}
                        >
                          {lesson.bloom_level}
                        </span>
                        <span className="text-xs text-slate-500">
                          {lesson.duration_minutes} min
                        </span>
                      </div>
                      <h4 className="font-medium text-white">{lesson.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">
                        {lesson.description}
                      </p>
                      {lesson.key_concepts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {lesson.key_concepts.slice(0, 4).map((concept, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-4 mt-8"
      >
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
          >
            Generate Another
          </button>
        )}
        {onSave && (
          <button
            onClick={onSave}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all"
          >
            Save Course
          </button>
        )}
      </motion.div>
    </div>
  );
}






