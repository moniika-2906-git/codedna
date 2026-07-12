import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

const CustomPassword = Password({
  profile(params) {
    return {
      email: params.email as string,
      name: params.name as string,
      role: (params.role as "STUDENT" | "RECRUITER" | "ADMIN") ?? "STUDENT",
    };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [CustomPassword],
});