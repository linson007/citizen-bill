import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import type { UserRole } from "@/generated/prisma/enums";
import { getGoogleOAuthEnv } from "@/lib/google-oauth-env";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: getGoogleOAuthEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getGoogleOAuthEnv("GOOGLE_CLIENT_SECRET"),
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        const appUser = user as typeof user & { role?: UserRole };

        session.user.id = user.id;
        session.user.role = appUser.role ?? "USER";
      }

      return session;
    },
  },
};
