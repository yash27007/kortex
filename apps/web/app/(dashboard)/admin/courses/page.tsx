"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { HiBookOpen, HiArrowLeft, HiEye, HiTrash, HiArrowsUpDown, HiCheckCircle, HiXCircle, HiPencil, HiPlus, HiSparkles, HiClock, HiEllipsisVertical } from "react-icons/hi2";
import { useTRPC, useQuery, useMutation } from "@/server/trpc/client";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Component-level api hook wrapper
function useAdminCourses() {
  const api = useTRPC();
  return useQuery(api.admin.getAllCourses.queryOptions({ limit: 100 }, { staleTime: 1000 * 60 }));
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string | null;
  difficulty: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
  _count: {
    modules: number;
    enrollments: number;
  };
  generatedBy: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

export default function AdminCoursesPage() {
  const api = useTRPC();
  const router = useRouter();
  const { data, isLoading, refetch } = useAdminCourses();

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
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete course");
    },
  }));

  const handleTogglePublish = (courseId: string, currentStatus: boolean) => {
    if (confirm(`Are you sure you want to ${currentStatus ? 'unpublish' : 'publish'} this course?`)) {
      togglePublishMutation.mutate({ courseId, isPublished: !currentStatus });
    }
  };

  const handleDelete = (courseId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteMutation.mutate({ courseId });
    }
  };

  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="gap-1 -ml-3"
        >
          Course
          <HiArrowsUpDown className="h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
              <HiBookOpen className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <div className="font-medium text-white flex items-center gap-2">
                {course.title}
                {course.isFeatured && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
                    Featured
                  </Badge>
                )}
              </div>
              <div className="text-sm text-slate-500">{course.slug}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-slate-400">
          {row.original.category || "Uncategorized"}
        </span>
      ),
    },
    {
      accessorKey: "difficulty",
      header: "Difficulty",
      cell: ({ row }) => {
        const difficulty = row.original.difficulty;
        const colors = {
          BEGINNER: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          INTERMEDIATE: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          ADVANCED: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          EXPERT: "bg-red-500/10 text-red-400 border-red-500/30",
        };
        return (
          <Badge variant="outline" className={colors[difficulty as keyof typeof colors] || colors.BEGINNER}>
            {difficulty}
          </Badge>
        );
      },
    },
    {
      accessorKey: "_count.modules",
      header: "Modules",
      cell: ({ row }) => (
        <span className="text-slate-400">{row.original._count.modules}</span>
      ),
    },
    {
      accessorKey: "_count.enrollments",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="gap-1 -ml-3"
        >
          Enrollments
          <HiArrowsUpDown className="h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-amber-400">
          {row.original._count.enrollments}
        </span>
      ),
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: ({ row }) => {
        const course = row.original;
        const isPublished = course.isPublished;
        const hasModules = course._count.modules > 0;

        if (isPublished) {
          return (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              <HiCheckCircle className="w-3 h-3 mr-1" />
              Published
            </Badge>
          );
        }

        if (hasModules) {
          return (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
              <HiClock className="w-3 h-3 mr-1" />
              Staging
            </Badge>
          );
        }

        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
            <HiSparkles className="w-3 h-3 mr-1 animate-pulse" />
            Generating
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="gap-1 -ml-3"
        >
          Created
          <HiArrowsUpDown className="h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {format(row.original.createdAt, "MMM d, yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const course = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                <span className="sr-only">Open menu</span>
                <HiEllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem
                onClick={() => router.push(`/admin/courses/${course.id}`)}
                className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
              >
                <HiEye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              {course.isPublished && (
                <DropdownMenuItem
                  onClick={() => handleTogglePublish(course.id, course.isPublished)}
                  className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                  disabled={togglePublishMutation.isPending}
                >
                  <HiXCircle className="mr-2 h-4 w-4" />
                  Unpublish
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => handleDelete(course.id, course.title)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                disabled={deleteMutation.isPending}
              >
                <HiTrash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <HiBookOpen className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Course Management</h1>
              <p className="text-slate-400">
                Manage all courses on the platform
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/admin/courses/new')}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <HiPlus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>
      </motion.header>

      {/* Courses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full bg-slate-800" />
            <Skeleton className="h-96 w-full bg-slate-800 rounded-xl" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.courses ?? []}
            searchKey="title"
            searchPlaceholder="Search courses..."
          />
        )}
      </motion.div>
    </div>
  );
}




