import { NextResponse } from "next/server";
import NextAuth from "next-auth";

// ✅ Edge-safe auth config — NO prisma, NO bcrypt, NO Node.js APIs
const { auth } = NextAuth({
  providers: [], // No providers needed in middleware
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token }) {
      return token; // Just pass through — no DB calls
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.hotelId = token.hotelId as string | null;
      }
      return session;
    },
  },
});

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const hasHotel = !!session?.user?.hotelId;

  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/signup");

  const isDashboardRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/rooms") ||
    nextUrl.pathname.startsWith("/bookings") ||
    nextUrl.pathname.startsWith("/calendar") ||
    nextUrl.pathname.startsWith("/guests") ||
    nextUrl.pathname.startsWith("/analytics") ||
    nextUrl.pathname.startsWith("/settings");

  const isOnboardingRoute = nextUrl.pathname.startsWith("/onboarding");

  if (isAuthRoute && isLoggedIn) {
    if (!hasHotel) return NextResponse.redirect(new URL("/onboarding", nextUrl));
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isDashboardRoute && isLoggedIn && !hasHotel) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  if (isOnboardingRoute && isLoggedIn && hasHotel) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};