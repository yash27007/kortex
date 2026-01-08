"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { HiSparkles, HiPlus, HiXMark } from "react-icons/hi2";

export interface CourseFormData {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  num_modules: number;
  topics: string[];
  learning_objectives: string[];
}

interface CourseFormProps {
  onSubmit: (data: CourseFormData) => void;
  isLoading: boolean;
}

export function CourseForm({ onSubmit, isLoading }: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    difficulty: "beginner",
    num_modules: 4,
    topics: [],
    learning_objectives: [],
  });

  const [newTopic, setNewTopic] = useState("");
  const [newObjective, setNewObjective] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit(formData);
    }
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      setFormData((prev) => ({
        ...prev,
        topics: [...prev.topics, newTopic.trim()],
      }));
      setNewTopic("");
    }
  };

  const removeTopic = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index),
    }));
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData((prev) => ({
        ...prev,
        learning_objectives: [...prev.learning_objectives, newObjective.trim()],
      }));
      setNewObjective("");
    }
  };

  const removeObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      learning_objectives: prev.learning_objectives.filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Course Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="e.g., Introduction to Machine Learning"
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
          required
          disabled={isLoading}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Briefly describe what this course will cover..."
          rows={3}
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
          disabled={isLoading}
        />
      </div>

      {/* Difficulty & Modules */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                difficulty: e.target.value as CourseFormData["difficulty"],
              }))
            }
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
            disabled={isLoading}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Modules
          </label>
          <select
            value={formData.num_modules}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                num_modules: parseInt(e.target.value),
              }))
            }
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
            disabled={isLoading}
          >
            {[2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
              <option key={n} value={n}>
                {n} modules
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Topics */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Topics to Cover
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
            placeholder="Add a topic..."
            className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={addTopic}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            disabled={isLoading}
          >
            <HiPlus className="w-5 h-5" />
          </button>
        </div>
        {formData.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.topics.map((topic, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full"
              >
                {topic}
                <button
                  type="button"
                  onClick={() => removeTopic(index)}
                  className="hover:text-red-400 transition-colors"
                  disabled={isLoading}
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Learning Objectives */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Learning Objectives
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addObjective())}
            placeholder="Add a learning objective..."
            className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={addObjective}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            disabled={isLoading}
          >
            <HiPlus className="w-5 h-5" />
          </button>
        </div>
        {formData.learning_objectives.length > 0 && (
          <div className="space-y-2">
            {formData.learning_objectives.map((objective, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg"
              >
                <span className="text-amber-400 text-sm font-medium">
                  {index + 1}.
                </span>
                <span className="flex-1 text-sm text-slate-300">{objective}</span>
                <button
                  type="button"
                  onClick={() => removeObjective(index)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                  disabled={isLoading}
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isLoading || !formData.title.trim()}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${isLoading || !formData.title.trim()
            ? "bg-slate-700 text-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
          }`}
      >
        <HiSparkles className="w-5 h-5" />
        {isLoading ? "Generating..." : "Generate Course"}
      </motion.button>
    </form>
  );
}








