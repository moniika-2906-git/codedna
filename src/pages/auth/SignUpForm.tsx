import { FormEvent, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { UserRole } from "./types";

interface SignUpFormProps {
  defaultRole: UserRole;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "STUDENT", label: "Student" },
  { value: "RECRUITER", label: "Recruiter" },
];

export const SignUpForm = ({ defaultRole }: SignUpFormProps) => {
  const { signIn } = useAuthActions();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn("password", {
        name,
        email,
        password,
        role,
        flow: "signUp",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? "Could not create your account. The email may already be in use."
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <Alert
          variant="destructive"
          className="border-red-900/50 bg-red-950/40 text-red-400 [&>svg]:text-red-400"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-name" className="text-zinc-300">
          Name
        </Label>
        <Input
          id="signup-name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-email" className="text-zinc-300">
          Email
        </Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-password" className="text-zinc-300">
          Password
        </Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-zinc-300">I am a</Label>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRole(option.value)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                role === option.value
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 bg-indigo-500 text-zinc-50 hover:bg-indigo-400"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Sign Up"
        )}
      </Button>
    </form>
  );
};
