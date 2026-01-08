"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { HiUsers, HiArrowLeft, HiEye, HiTrash, HiArrowsUpDown } from "react-icons/hi2";
import { useTRPC, useQuery } from "@/server/trpc/client";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

// Component-level api hook wrapper
function useAdminUsers() {
  const api = useTRPC();
  return useQuery(api.admin.getAllUsers.queryOptions({ limit: 100 }, { staleTime: 1000 * 60 }));
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  totalXp: number;
  level: number;
  currentStreak: number;
  createdAt: Date;
  _count: {
    enrollments: number;
    lessonProgress: number;
    badges: number;
  };
}

export default function AdminUsersPage() {
  // Fetch all users
  const { data, isLoading } = useAdminUsers();

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.firstName || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  {(user.firstName?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium text-white">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-slate-500">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "level",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="gap-1 -ml-3"
        >
          Level
          <HiArrowsUpDown className="h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
          Lvl {row.original.level}
        </Badge>
      ),
    },
    {
      accessorKey: "totalXp",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="gap-1 -ml-3"
        >
          XP
          <HiArrowsUpDown className="h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-amber-400">
          {row.original.totalXp.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "currentStreak",
      header: "Streak",
      cell: ({ row }) => (
        <span className="flex items-center gap-1">
          {row.original.currentStreak > 0 && "🔥"}
          {row.original.currentStreak} days
        </span>
      ),
    },
    {
      accessorKey: "_count.enrollments",
      header: "Courses",
      cell: ({ row }) => row.original._count.enrollments,
    },
    {
      accessorKey: "_count.lessonProgress",
      header: "Lessons",
      cell: ({ row }) => row.original._count.lessonProgress,
    },
    {
      accessorKey: "_count.badges",
      header: "Badges",
      cell: ({ row }) => (
        <span className="flex items-center gap-1">
          🏆 {row.original._count.badges}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="gap-1 -ml-3"
        >
          Joined
          <HiArrowsUpDown className="h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/users/${row.original.id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <HiEye className="h-4 w-4" />
              View
            </Button>
          </Link>
        </div>
      ),
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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <HiUsers className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-slate-400">
              View and manage all registered users
            </p>
          </div>
        </div>
      </motion.header>

      {/* Users Table */}
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
            data={data?.users ?? []}
            searchKey="email"
            searchPlaceholder="Search by email..."
          />
        )}
      </motion.div>
    </div>
  );
}





