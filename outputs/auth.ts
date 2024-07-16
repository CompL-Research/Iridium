import NextAuth from 'next-auth';
import authConfig from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/auth.config.ts";
var _NextAuth = NextAuth(authConfig),
  auth = _NextAuth.auth,
  handlers = _NextAuth.handlers,
  signOut = _NextAuth.signOut,
  signIn = _NextAuth.signIn;
export { auth, handlers, signOut, signIn };