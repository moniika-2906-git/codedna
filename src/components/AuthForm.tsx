"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, Terminal } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type Role = "STUDENT" | "RECRUITER";
type AuthTab = "signin" | "signup";

const fieldClass =
  "bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-indigo-500 focus-visible:ring-offset-zinc-900";

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState<AuthTab>("signin");
  const [error, setError] = useState<string | null>(null);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [signUpLoading, setSignUpLoading] = useState(false);

  const handleSignIn = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignInLoading(true);
    // TODO: wire up Convex auth sign-in here
    setSignInLoading(false);
  };

  const handleSignUp = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignUpLoading(true);
    // TODO: wire up Convex auth sign-up here
    setSignUpLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <Terminal className="h-6 w-6" />
          </div>
          <span className="text-xl font-semibold text-zinc-100">
            Code<span className="text-indigo-400">DNA</span>
          </span>
          <p className="text-sm text-zinc-500">
            Sign in to continue your assessment
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl shadow-black/20">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as AuthTab);
              setError(null);
            }}
          >
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
              <TabsTrigger
                value="signin"
                className="text-zinc-400 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="text-zinc-400 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <TabsContent value="signin" className="mt-6">
              <form className="space-y-4" onSubmit={handleSignIn}>
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-zinc-300">
                    Email
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className={fieldClass}
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-zinc-300">
                    Password
                  </Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className={fieldClass}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={signInLoading}
                  className="w-full bg-indigo-500 text-white hover:bg-indigo-400"
                >
                  {signInLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {signInLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form className="space-y-4" onSubmit={handleSignUp}>
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-zinc-300">
                    Name
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Jane Doe"
                    required
                    className={fieldClass}
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-zinc-300">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className={fieldClass}
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-zinc-300">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className={fieldClass}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">I am a</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={(value) => setRole(value as Role)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {(
                      [
                        { value: "STUDENT", label: "Student" },
                        { value: "RECRUITER", label: "Recruiter" },
                      ] as const
                    ).map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`role-${option.value}`}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-normal transition-colors",
                          role === option.value
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                            : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                        )}
                      >
                        <RadioGroupItem
                          id={`role-${option.value}`}
                          value={option.value}
                          className="border-zinc-600 text-indigo-400"
                        />
                        {option.label}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
                <Button
                  type="submit"
                  disabled={signUpLoading}
                  className="w-full bg-indigo-500 text-white hover:bg-indigo-400"
                >
                  {signUpLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {signUpLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;