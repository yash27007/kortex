import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@kortex/db';

/**
 * Looks up the Prisma `User` row for a Clerk-authenticated visitor,
 * creating it on first access.
 *
 * The "proper" sync path is the `/api/webhooks/clerk` Svix webhook, but
 * that requires a public HTTPS endpoint registered in the Clerk dashboard —
 * something local dev (and any environment without that webhook wired up)
 * doesn't have. Without this fallback, a freshly signed-up Clerk user has
 * no matching `User` row, and every learner-facing page that expects one
 * (dashboard stats, enrollment, course access) silently 404s or bounces
 * back to /dashboard.
 */
export async function getOrCreateUser(clerkId: string) {
  const existing = await prisma.user.findFirst({ where: { clerkId } });
  if (existing) {
    return existing;
  }

  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== clerkId) {
    return null;
  }

  const primaryEmail = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId
  );

  if (!primaryEmail) {
    return null;
  }

  return prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: {
      clerkId,
      email: primaryEmail.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
  });
}
