import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Trophy, Zap, Target, Calendar, BookOpen, Award } from "lucide-react";

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        {/* Profile Header */}
        <section className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-gray-400 mb-3">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-300">Level 1</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-violet-500" />
                    <span className="text-gray-300">0 XP</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-300">
                      Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProgressCard
              icon={<BookOpen className="w-5 h-5" />}
              label="Courses Completed"
              value="0"
              subtext="Start learning!"
              color="from-blue-500 to-cyan-500"
            />
            <ProgressCard
              icon={<Target className="w-5 h-5" />}
              label="Lessons Completed"
              value="0"
              subtext="Complete lessons to earn XP"
              color="from-green-500 to-emerald-500"
            />
            <ProgressCard
              icon={<Award className="w-5 h-5" />}
              label="Badges Earned"
              value="0"
              subtext="Unlock achievements"
              color="from-purple-500 to-pink-500"
            />
          </div>
        </section>

        {/* XP Progress */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Level Progress</h2>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Level 1</span>
              <span className="text-gray-400">Level 2</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-3 rounded-full transition-all"
                style={{ width: "0%" }}
              />
            </div>
            <p className="text-sm text-gray-400 text-center">
              0 / 1000 XP to next level
            </p>
          </div>
        </section>

        {/* Badges Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Badges</h2>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-8 text-center">
            <Award className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No badges yet</h3>
            <p className="text-gray-400">
              Complete courses and achievements to earn badges
            </p>
          </div>
        </section>

        {/* Account Settings */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Account Settings</h2>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
            <UserProfile
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none w-full",
                  navbar: "hidden",
                  pageScrollBox: "p-0",
                  profileSection: "border-gray-700",
                  profileSectionTitle: "text-gray-400",
                  profileSectionTitleText: "text-gray-400",
                  profileSectionContent: "text-white",
                  formFieldLabel: "text-gray-300",
                  formFieldInput:
                    "bg-gray-700 border-gray-600 text-white placeholder:text-gray-500",
                  formButtonPrimary:
                    "bg-violet-600 hover:bg-violet-700 text-sm normal-case",
                  accordionTriggerButton: "text-white hover:bg-gray-700",
                  accordionContent: "text-gray-300",
                },
              }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function ProgressCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: string;
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${color} mb-4`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-400 font-medium mb-1">{label}</p>
      <p className="text-sm text-gray-500">{subtext}</p>
    </div>
  );
}
