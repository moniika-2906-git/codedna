import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Dna } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import type { UserRole } from "./types";

const roleHomePath = (role: UserRole | undefined) =>
  role === "RECRUITER" ? "/dashboard" : "/problems";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.users.viewer, isAuthenticated ? {} : "skip");

  const initialFlow = searchParams.get("flow") === "signUp" ? "signUp" : "signIn";
  const initialRole: UserRole =
    searchParams.get("role") === "RECRUITER" ? "RECRUITER" : "STUDENT";

  const [tab, setTab] = useState<"signIn" | "signUp">(initialFlow);

  // Once authenticated (fresh sign-in/sign-up or already-logged-in visit),
  // send the user to the page matching their role.
  useEffect(() => {
    if (isAuthenticated && viewer !== undefined) {
      navigate(roleHomePath(viewer?.role as UserRole | undefined), {
        replace: true,
      });
    }
  }, [isAuthenticated, viewer, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md rounded-xl border-zinc-800 bg-zinc-900">
        <CardHeader className="items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10">
            <Dna className="h-5 w-5 text-indigo-400" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-100">
            Welcome to CodeDNA
          </h1>
          <p className="text-sm text-zinc-400">
            Sign in to your account or create a new one
          </p>
        </CardHeader>
        <CardContent>
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as "signIn" | "signUp")}
          >
            <TabsList className="grid w-full grid-cols-2 border border-zinc-800 bg-zinc-950">
              <TabsTrigger
                value="signIn"
                className="text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signUp"
                className="text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="signIn" className="mt-6">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signUp" className="mt-6">
              <SignUpForm defaultRole={initialRole} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
