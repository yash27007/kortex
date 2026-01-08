"use client";

import { useState, useEffect, useRef } from "react";
import { HiSparkles, HiCheck } from "react-icons/hi2";
import { motion, AnimatePresence } from "motion/react";
import { useTRPC, useQuery } from "@/server/trpc/client";
import { cn } from "@/lib/utils";

interface AISuggestionsProps {
  field: "title" | "description" | "category" | "outcome" | "targetAudience";
  value: string;
  context?: {
    title?: string;
    description?: string;
    category?: string;
    difficulty?: string;
  };
  onSelect: (suggestion: string) => void;
  className?: string;
}

export function AISuggestions({
  field,
  value,
  context,
  onSelect,
  className,
}: AISuggestionsProps) {
  const api = useTRPC();
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce the value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // Fetch suggestions when value changes and is meaningful
  const shouldFetch = debouncedValue.length >= 3 && isOpen;
  const { data: suggestions, isLoading } = useQuery(
    api.admin.getCourseSuggestions.queryOptions(
      {
        field,
        input: debouncedValue,
        context: context || {},
      },
      {
        enabled: shouldFetch,
        staleTime: 1000 * 60, // Cache for 1 minute
      }
    )
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show suggestions when user types
  useEffect(() => {
    if (value.length >= 3) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [value]);

  if (!isOpen || !shouldFetch) {
    return null;
  }

  const suggestionList = suggestions?.suggestions || [];

  if (suggestionList.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <AnimatePresence>
        {isOpen && (suggestionList.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
          >
            {isLoading ? (
              <div className="p-3 flex items-center gap-2 text-slate-400">
                <HiSparkles className="w-4 h-4 animate-pulse text-amber-400" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-slate-700 bg-slate-900/50">
                  <div className="flex items-center gap-2 text-xs text-amber-400">
                    <HiSparkles className="w-3 h-3" />
                    <span>AI Suggestions</span>
                  </div>
                </div>
                {suggestionList.map((suggestion: string, index: number) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      onSelect(suggestion);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-3 hover:bg-slate-700/50 transition-colors flex items-start gap-2 group"
                  >
                    <HiCheck className="w-4 h-4 text-amber-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    <span className="text-sm text-slate-300 group-hover:text-white flex-1">
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




