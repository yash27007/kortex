"use client";

import { motion } from "motion/react";
import { HiSparkles, HiCheckCircle, HiClock } from "react-icons/hi2";
import { useTRPC, useQuery } from "@/server/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CourseGenerationStatusProps {
  courseId: string;
}

export function CourseGenerationStatus({ courseId }: CourseGenerationStatusProps) {
  const api = useTRPC();
  const { data: status, isLoading } = useQuery(
    api.admin.getCourseGenerationStatus.queryOptions({ courseId }, {
      refetchInterval: 5000, // Poll every 5 seconds
      staleTime: 1000,
    })
  );

  if (isLoading || !status) {
    return (
      <Card className="bg-slate-900/50 border-white/10">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-800 rounded w-1/3"></div>
            <div className="h-2 bg-slate-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isGenerating = status.status === 'generating';
  const progress = status.progress;

  return (
    <Card className="bg-slate-900/50 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiSparkles className={`w-5 h-5 ${isGenerating ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
            <CardTitle className="text-white">AI Generation Status</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={isGenerating ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
          >
            {isGenerating ? (
              <>
                <HiClock className="w-3 h-3 mr-1 animate-spin" />
                Generating
              </>
            ) : (
              <>
                <HiCheckCircle className="w-3 h-3 mr-1" />
                Complete
              </>
            )}
          </Badge>
        </div>
        <CardDescription>
          {isGenerating
            ? 'AI agent is creating modules and lessons...'
            : 'Course generation completed successfully'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Overall Progress</span>
            <span className="text-white font-medium">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{progress.modules}</div>
            <div className="text-xs text-slate-400">Modules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{progress.lessons}</div>
            <div className="text-xs text-slate-400">Lessons</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{progress.lessonsWithContent}</div>
            <div className="text-xs text-slate-400">With Content</div>
          </div>
        </div>

        {isGenerating && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-slate-400">
              The AI agent is working on: Creating modules, generating lesson content, and verifying quality...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}




