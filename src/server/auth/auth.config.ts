import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/server/db";
import { compare } from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login?error=true",
    newUser: "/register",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentialsSchema.parse(credentials);

          const user = await db.user.findUnique({
            where: { email },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isPasswordValid = await compare(password, user.passwordHash);
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, embed the user's primary organization ID into the token
      if (user) {
        token["id"] = user.id;

        // Fetch the user's primary organization membership
        const membership = await db.organizationMember.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "asc" },
          select: {
            organizationId: true,
            role: true,
          },
        });

        if (membership) {
          token["organizationId"] = membership.organizationId;
          token["organizationRole"] = membership.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token["id"] as string;
        // Propagate organization context to the session
        (session as any).organizationId = token["organizationId"] as
          | string
          | undefined;
        (session as any).organizationRole = token["organizationRole"] as
          | string
          | undefined;
      }
      return session;
    },
  },
};
