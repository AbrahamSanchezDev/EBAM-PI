import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Public pages that don't require auth
      const publicPaths = ['/', '/login'];

      // If user is logged in, allow access everywhere
      if (isLoggedIn) return true;

      // If the requested path is public, allow access without auth
      if (publicPaths.includes(pathname)) return true;

      // Otherwise, redirect unauthenticated users to the main page
      return Response.redirect(new URL('/', nextUrl));
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;