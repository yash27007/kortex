import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@kortex/db';
import { NextResponse } from 'next/server';

/**
 * Development-only endpoint to sync the current Clerk user to the database.
 * Use this when webhooks aren't set up yet.
 *
 * GET /api/dev/sync-user
 */
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Could not fetch user details' },
        { status: 500 }
      );
    }

    const primaryEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    );

    if (!primaryEmail) {
      return NextResponse.json(
        { error: 'No primary email found' },
        { status: 400 }
      );
    }

    // Upsert the user
    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: primaryEmail.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
      create: {
        clerkId: userId,
        email: primaryEmail.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User synced successfully',
      user: {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        xp: dbUser.totalXp,
        level: dbUser.level,
      },
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user', details: String(error) },
      { status: 500 }
    );
  }
}
