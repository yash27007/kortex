import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextMiddleware } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'

// Define routes that require Clerk authentication (learners only)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/courses(.*)',
  '/learn(.*)',
])

// Define routes that are always public
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/admin/login',
  '/api/admin/logout',
  '/admin/login',
])

// Admin routes that require admin authentication (not Clerk)
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
])

const middleware = clerkMiddleware(async (auth: any, req: any) => {
  const pathname = req.nextUrl.pathname

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Check admin routes first - they need admin session, not Clerk
  if (isAdminRoute(req) && !pathname.startsWith('/admin/login')) {
    const adminSession = await getAdminSession()
    
    if (!adminSession) {
      // Redirect to admin login if not authenticated
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Admin is authenticated, allow access
    return NextResponse.next()
  }

  // Protect learner routes with Clerk
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  return NextResponse.next()
})

// Type assertion to work around Next.js 16 type inference issue
export default middleware as unknown as NextMiddleware

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
