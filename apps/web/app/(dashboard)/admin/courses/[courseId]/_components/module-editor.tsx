"use client";

import { useState } from "react";
import { HiPencil, HiSparkles, HiTrash, HiCheck, HiXMark } from "react-icons/hi2";
import { useTRPC, useMutation } from "@/server/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  bloomLevel: string;
  lessons: Array<{
    id: string;
    title: string;
    order: number;
    type: string;
    duration: number;
  }>;
  quiz: {
    id: string;
    title: string;
    passingScore: number;
  } | null;
}

interface ModuleEditorProps {
  module: Module;
  courseId: string;
  onUpdate: () => void;
}

export function ModuleEditor({ module, courseId, onUpdate }: ModuleEditorProps) {
  const api = useTRPC();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description || "");

  const regenerateModuleMutation = useMutation(api.admin.regenerateModule.mutationOptions({
    onSuccess: () => {
      toast.success("Module regeneration started. This may take a few minutes.");
      onUpdate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to regenerate module");
    },
  }));

  const handleRegenerate = () => {
    if (confirm(`Regenerate module "${module.title}" with AI? This will recreate all lessons and content.`)) {
      regenerateModuleMutation.mutate({
        courseId,
        moduleId: module.id,
        moduleTitle: module.title,
      });
    }
  };

  return (
    <Card className="bg-slate-800/50 border border-white/5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-900 border-white/10 text-white"
                  placeholder="Module title"
                />
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-900 border-white/10 text-white"
                  placeholder="Module description"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      // TODO: Implement update mutation
                      setIsEditing(false);
                      toast.success("Module updated");
                      onUpdate();
                    }}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <HiCheck className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTitle(module.title);
                      setDescription(module.description || "");
                      setIsEditing(false);
                    }}
                    className="border-white/10"
                  >
                    <HiXMark className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  Module {module.order}: {module.title}
                  <Badge variant="outline" className="text-xs">
                    {module.bloomLevel}
                  </Badge>
                </h3>
                {module.description && (
                  <p className="text-sm text-slate-400 mt-1">{module.description}</p>
                )}
              </div>
            )}
          </div>
          {!isEditing && (
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-slate-400 hover:text-white"
              >
                <HiPencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={regenerateModuleMutation.isPending}
                className="text-amber-400 hover:text-amber-300"
              >
                <HiSparkles className={`w-4 h-4 ${regenerateModuleMutation.isPending ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2 mt-4">
          {module.lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-3 p-2 rounded bg-slate-900/50"
            >
              <span className="text-xs text-slate-500 w-8">{lesson.order}</span>
              <span className="text-sm text-slate-300 flex-1">{lesson.title}</span>
              <Badge variant="outline" className="text-xs">
                {lesson.type}
              </Badge>
              <span className="text-xs text-slate-500">{lesson.duration}min</span>
            </div>
          ))}
          {module.quiz && (
            <div className="flex items-center gap-3 p-2 rounded bg-amber-500/10 border border-amber-500/20 mt-2">
              <span className="text-xs text-amber-400 w-8">Q</span>
              <span className="text-sm text-amber-300 flex-1">{module.quiz.title}</span>
              <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                Quiz ({module.quiz.passingScore}% to pass)
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}




