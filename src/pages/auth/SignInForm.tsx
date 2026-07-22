import { FormEvent, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const SignInForm = () => {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn("password", { email, password, flow: "signIn" });
    } catch (err) {
      setError(
        err instanceof Error
          ? "Invalid email or password. Please try again."
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
        <Label htmlFor="signin-email" className="text-zinc-300">
          Email
        </Label>
        <Input
          id="signin-email"
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
        <Label htmlFor="signin-password" className="text-zinc-300">
          Password
        </Label>
        <Input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 bg-indigo-500 text-zinc-50 hover:bg-indigo-400"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
};
