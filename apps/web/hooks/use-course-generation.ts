"use client";

import { useState, useCallback, useRef } from "react";
import type { GenerationStep, CourseFormData } from "@/components/generate";

interface Course {
  title: string;
  description: string;
  difficulty: string;
  estimated_duration_hours: number;
  learning_objectives: string[];
  modules: Array<{
    title: string;
    description: string;
    order: number;
    lessons: Array<{
      title: string;
      description: string;
      bloom_level: string;
      duration_minutes: number;
      content_outline: string[];
      key_concepts: string[];
    }>;
  }>;
  prerequisites: string[];
  target_audience: string;
}

interface GenerationEvent {
  event_type: "step_update" | "complete" | "error";
  step?: GenerationStep;
  course?: Course;
  error?: string;
}

interface UseCourseGenerationReturn {
  steps: GenerationStep[];
  course: Course | null;
  error: string | null;
  isGenerating: boolean;
  progress: number;
  generate: (data: CourseFormData) => void;
  reset: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:8000";

export function useCourseGeneration(): UseCourseGenerationReturn {
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  const reset = useCallback(() => {
    setSteps([]);
    setCourse(null);
    setError(null);
    setIsGenerating(false);
    setProgress(0);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const generate = useCallback(async (data: CourseFormData) => {
    reset();
    setIsGenerating(true);

    try {
      // Use fetch with POST to initiate SSE stream
      const response = await fetch(`${API_BASE_URL}/api/generate/course/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const jsonStr = line.slice(5).trim();
              if (!jsonStr) continue;
              
              const event: GenerationEvent = JSON.parse(jsonStr);

              if (event.event_type === "step_update" && event.step) {
                setSteps((prev) => {
                  const existingIndex = prev.findIndex(
                    (s) => s.step_id === event.step!.step_id
                  );
                  if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = event.step!;
                    return updated;
                  }
                  return [...prev, event.step!];
                });
                setProgress(event.step.progress);
              } else if (event.event_type === "complete" && event.course) {
                setCourse(event.course);
                setIsGenerating(false);
              } else if (event.event_type === "error") {
                setError(event.error || "An error occurred");
                setIsGenerating(false);
              }
            } catch (parseError) {
              console.error("Failed to parse SSE event:", parseError);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to server");
      setIsGenerating(false);
    }
  }, [reset]);

  return {
    steps,
    course,
    error,
    isGenerating,
    progress,
    generate,
    reset,
  };
}








