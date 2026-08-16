import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth.config";
import { db } from "@/server/db";

export async function getCurrentSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();

  if (!session?.user?.email) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
}

export async function getCurrentUserOrThrow() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized: No user found");
  }

  return user;
}
