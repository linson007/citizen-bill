import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import type { UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

function requireGoogleOAuthEnv(name: "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET") {
  const value = process.env[name]?.trim();

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `${name} is required in production. Set it in the deployment environment.`,
    );
  }

  return "";
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: requireGoogleOAuthEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireGoogleOAuthEnv("GOOGLE_CLIENT_SECRET"),
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
