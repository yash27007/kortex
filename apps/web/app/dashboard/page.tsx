import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Trophy, Zap, Clock, ChevronRight } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.firstName || "Learner"}! 👋
          </h1>
          <p className="text-gray-400">
            Continue your learning journey and unlock new skills.
          </p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            label="Total XP"
            value="0"
            color="from-yellow-500 to-orange-500"
          />
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            label="Level"
            value="1"
            color="from-violet-500 to-purple-500"
          />
          <StatCard
            icon={<BookOpen className="w-5 h-5" />}
            label="Courses"
            value="0"
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Study Time"
            value="0h"
            color="from-green-500 to-emerald-500"
          />
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard
              title="Generate New Course"
              description="Use AI to create a personalized course on any topic"
              href="/courses/generate"
              gradient="from-violet-600 to-purple-600"
            />
            <ActionCard
              title="Browse Courses"
              description="Explore available courses and start learning"
              href="/courses"
              gradient="from-blue-600 to-cyan-600"
            />
            <ActionCard
              title="View Profile"
              description="Check your progress, badges, and settings"
              href="/profile"
              gradient="from-green-600 to-emerald-600"
            />
          </div>
        </section>

        {/* Continue Learning */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Continue Learning</h2>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No courses yet</h3>
            <p className="text-gray-400 mb-4">
              Start your learning journey by generating your first AI-powered course
            </p>
            <Link
              href="/courses/generate"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
            >
              Generate Course
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  gradient,
}: {
  title: string;
  description: string;
  href: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
      />
      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        {title}
        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </Link>
  );
}
