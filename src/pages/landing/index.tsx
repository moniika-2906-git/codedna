import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeatureGrid } from "./FeatureGrid";
import { LandingFooter } from "./LandingFooter";

const LandingPage = () => {
  return (
    <div className="flex min-h-full flex-col bg-zinc-950">
      <section className="relative overflow-hidden border-b border-zinc-800">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,theme(colors.indigo.500/0.18),transparent_60%)]"
          aria-hidden
        />
        <div className="container flex flex-col items-center gap-6 py-24 text-center sm:py-32">
          <Badge
            variant="outline"
            className="gap-1.5 border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-400"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            Powered by Microsoft Azure
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl md:text-6xl">
            CodeDNA — India&apos;s First{" "}
            <span className="text-indigo-400">Agentic Coding Assessment</span>{" "}
            Platform
          </h1>

          <p className="max-w-xl text-lg text-zinc-400">
            Don&apos;t ban AI. Measure how well engineers use it.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-indigo-500 text-zinc-50 hover:bg-indigo-400"
            >
              <Link to="/auth?flow=signUp&role=STUDENT">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-zinc-800 bg-transparent text-zinc-100 hover:bg-zinc-900 hover:text-zinc-100"
            >
              <Link to="/auth">View Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      <FeatureGrid />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
