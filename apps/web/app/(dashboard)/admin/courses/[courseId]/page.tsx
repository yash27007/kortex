"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { HiBookOpen, HiArrowLeft, HiCheckCircle, HiXCircle, HiTrash, HiUsers, HiClock } from "react-icons/hi2";
import { useTRPC, useQuery, useMutation } from "@/server/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";

function useAdminCourse(courseId: string) {
  const api = useTRPC();
  return useQuery(api.admin.getCourseById.queryOptions({ courseId }, { staleTime: 1000 * 60 }));
}

export default function AdminCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const api = useTRPC();
  const courseId = params.courseId as string;

  const { data: course, isLoading, refetch } = useAdminCourse(courseId);

  const togglePublishMutation = useMutation(api.admin.toggleCoursePublish.mutationOptions({
    onSuccess: () => {
      toast.success("Course status updated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update course");
    },
  }));

  const deleteMutation = useMutation(api.admin.deleteCourse.mutationOptions({
    onSuccess: () => {
      toast.success("Course deleted");
      router.push("/admin/courses");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete course");
    },
  }));

  const handleTogglePublish = () => {
    if (!course) return;
    if (confirm(`Are you sure you want to ${course.isPublished ? 'unpublish' : 'publish'} this course?`)) {
      togglePublishMutation.mutate({ courseId, isPublished: !course.isPublished });
    }
  };

  const handleDelete = () => {
    if (!course) return;
    if (confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
      deleteMutation.mutate({ courseId });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <Skeleton className="h-8 w-64 bg-slate-800 mb-4" />
        <Skeleton className="h-96 w-full bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center text-slate-400">
          <h2 className="text-xl font-semibold text-white mb-2">Course not found</h2>
          <Link href="/admin/courses" className="text-amber-400 hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const totalDuration = course.modules.reduce((acc, module) => acc + module.estimatedMinutes, 0);

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <HiBookOpen className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{course.title}</h1>
              <p className="text-slate-400">{course.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleTogglePublish}
              disabled={togglePublishMutation.isPending}
              className={course.isPublished ? "border-emerald-500/30 text-emerald-400" : "border-slate-500/30"}
            >
              {course.isPublished ? (
                <>
                  <HiXCircle className="w-4 h-4 mr-2" />
                  Unpublish
                </>
              ) : (
                <>
                  <HiCheckCircle className="w-4 h-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <HiTrash className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </motion.header>

      {/* AI Generation Status */}
      <div className="mb-8 space-y-6">
        <CourseGenerationStatus courseId={courseId} />
        <AIAgentVisualization courseId={courseId} />
      </div>

      {/* Course Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-400 text-sm">Description</Label>
              <p className="text-white mt-1">{course.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400 text-sm">Category</Label>
                <p className="text-white mt-1">{course.category || "Uncategorized"}</p>
              </div>
              <div>
                <Label className="text-slate-400 text-sm">Difficulty</Label>
                <Badge variant="outline" className="mt-1">
                  {course.difficulty}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-slate-400 text-sm">Status</Label>
              <div className="mt-1">
                {course.isPublished ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    <HiCheckCircle className="w-3 h-3 mr-1" />
                    Published
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/30">
                    <HiXCircle className="w-3 h-3 mr-1" />
                    Draft
                  </Badge>
                )}
              </div>
            </div>

            {course.generatedBy && (
              <div>
                <Label className="text-slate-400 text-sm">Generated By</Label>
                <p className="text-white mt-1">
                  {course.generatedBy.firstName} {course.generatedBy.lastName} ({course.generatedBy.email})
                </p>
              </div>
            )}

            <div>
              <Label className="text-slate-400 text-sm">Created</Label>
              <p className="text-white mt-1">{format(course.createdAt, "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <HiBookOpen className="w-4 h-4" />
                  <span className="text-sm">Modules</span>
                </div>
                <span className="text-white font-semibold">{course._count.modules}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <HiClock className="w-4 h-4" />
                  <span className="text-sm">Lessons</span>
                </div>
                <span className="text-white font-semibold">{totalLessons}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <HiUsers className="w-4 h-4" />
                  <span className="text-sm">Enrollments</span>
                </div>
                <span className="text-white font-semibold">{course._count.enrollments}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <HiClock className="w-4 h-4" />
                  <span className="text-sm">Duration</span>
                </div>
                <span className="text-white font-semibold">{Math.round(totalDuration / 60)}h</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modules */}
      <Card className="bg-slate-900/50 border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="text-white">Modules & Lessons</CardTitle>
          <CardDescription>{course.modules.length} modules, {totalLessons} lessons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {course.modules.map((module) => (
              <ModuleEditor
                key={module.id}
                module={module}
                courseId={courseId}
                onUpdate={() => refetch()}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Enrollments */}
      {course.enrollments.length > 0 && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Enrollments</CardTitle>
            <CardDescription>Latest {course.enrollments.length} enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {course.enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    {enrollment.user.imageUrl ? (
                      <img
                        src={enrollment.user.imageUrl}
                        alt={enrollment.user.firstName || "User"}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-slate-400 text-sm">
                        {(enrollment.user.firstName?.charAt(0) || enrollment.user.email.charAt(0)).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {enrollment.user.firstName} {enrollment.user.lastName}
                    </div>
                    <div className="text-sm text-slate-500">{enrollment.user.email}</div>
                  </div>
                  <div className="text-sm text-slate-400">
                    {format(enrollment.lastAccessedAt, "MMM d, yyyy")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Add Label component import
import { Label } from "@/components/ui/label";
import { CourseGenerationStatus } from "./_components/course-generation-status";
import { ModuleEditor } from "./_components/module-editor";
import { AIAgentVisualization } from "./_components/ai-agent-visualization";




