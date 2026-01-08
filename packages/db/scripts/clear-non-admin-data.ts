/**
 * Clear all non-admin data from the database
 * Keeps only admin users and their data
 */

import { prisma } from "../index";

async function clearNonAdminData() {
  console.log("🧹 Starting database cleanup...");

  try {
    // Get admin user IDs (users with email containing 'admin' or specific admin emails)
    const adminUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: "admin", mode: "insensitive" } },
          // Add specific admin emails here if needed
        ],
      },
      select: { id: true, email: true },
    });

    const adminUserIds = adminUsers.map((u) => u.id);
    console.log(`✅ Found ${adminUserIds.length} admin users:`, adminUsers.map((u) => u.email));

    // Delete in order to respect foreign key constraints
    console.log("🗑️  Deleting quiz attempts...");
    const deletedQuizAttempts = await prisma.quizAttempt.deleteMany({
      where: {
        userId: { notIn: adminUserIds },
      },
    });
    console.log(`   Deleted ${deletedQuizAttempts.count} quiz attempts`);

    console.log("🗑️  Deleting lesson progress...");
    const deletedProgress = await prisma.lessonProgress.deleteMany({
      where: {
        userId: { notIn: adminUserIds },
      },
    });
    console.log(`   Deleted ${deletedProgress.count} lesson progress records`);

    console.log("🗑️  Deleting user badges...");
    const deletedBadges = await prisma.userBadge.deleteMany({
      where: {
        userId: { notIn: adminUserIds },
      },
    });
    console.log(`   Deleted ${deletedBadges.count} user badges`);

    console.log("🗑️  Deleting enrollments...");
    const deletedEnrollments = await prisma.enrollment.deleteMany({
      where: {
        userId: { notIn: adminUserIds },
      },
    });
    console.log(`   Deleted ${deletedEnrollments.count} enrollments`);

    console.log("🗑️  Deleting courses (except admin-generated)...");
    const deletedCourses = await prisma.course.deleteMany({
      where: {
        generatedById: { notIn: adminUserIds },
      },
    });
    console.log(`   Deleted ${deletedCourses.count} courses`);

    console.log("🗑️  Deleting non-admin users...");
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: { notIn: adminUserIds },
      },
    });
    console.log(`   Deleted ${deletedUsers.count} non-admin users`);

    // Reset admin user gamification stats (optional)
    console.log("🔄 Resetting admin user stats...");
    await prisma.user.updateMany({
      where: { id: { in: adminUserIds } },
      data: {
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
      },
    });

    console.log("✅ Database cleanup complete!");
    console.log(`📊 Remaining users: ${adminUserIds.length}`);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('clear-non-admin-data.ts')) {
  clearNonAdminData()
    .then(() => {
      console.log("✨ Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    });
}

export { clearNonAdminData };




