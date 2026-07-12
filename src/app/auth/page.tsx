"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";

function AuthForm() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.users.viewer, isAuthenticated ? {} : "skip");
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFlow = searchParams.get("flow") === "signUp" ? "signUp" : "signIn";
  const initialRole = searchParams.get("role") === "RECRUITER" ? "RECRUITER" : "STUDENT";

  const [flow, setFlow] = useState<"signIn" | "signUp">(initialFlow);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "RECRUITER">(initialRole);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Only redirect once Convex confirms the auth state AND we have the
  // user's role — this avoids the race condition where we navigate away
  // before the client actually holds a valid auth token.
  useEffect(() => {
    if (submitted && isAuthenticated && viewer) {
      router.push(viewer.role === "RECRUITER" ? "/dashboard" : "/problems");
    }
  }, [submitted, isAuthenticated, viewer, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await signIn("password", {
        email,
        password,
        flow,
        name,
        role,
      });
      setSubmitted(true);
    } catch {
      setError(
        flow === "signIn"
          ? "Invalid email or password."
          : "Could not create account. Try a different email."
      );
    }
  }

  const loading = submitted;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">
          Code<span className="text-purple-400">DNA</span>
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          {flow === "signIn" ? "Welcome back." : "Create your account."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {flow === "signUp" && (
            <>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole("STUDENT")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                    role === "STUDENT"
                      ? "bg-purple-600 border-purple-600"
                      : "border-gray-700 text-gray-400"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("RECRUITER")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                    role === "RECRUITER"
                      ? "bg-purple-600 border-purple-600"
                      : "border-gray-700 text-gray-400"
                  }`}
                >
                  Recruiter
                </button>
              </div>
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 py-2.5 rounded-lg font-medium transition"
          >
            {loading ? "Please wait..." : flow === "signIn" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-6 text-center">
          {flow === "signIn" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="text-purple-400 hover:underline"
          >
            {flow === "signIn" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black" />}>
      <AuthForm />
    </Suspense>
  );
}