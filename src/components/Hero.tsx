import Link from "next/link";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-zinc-950 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-indigo-500/20 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-400">
          POWERED BY MICROSOFT AZURE
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
          Code<span className="text-indigo-400">DNA</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-zinc-300">
          India&apos;s First Agentic Coding Assessment Platform
        </p>
        <p className="mt-2 max-w-xl text-base text-zinc-500">
          Don&apos;t ban AI. Measure how well engineers use it.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-indigo-500 text-white hover:bg-indigo-400"
          >
            <Link href="/auth?flow=signUp&role=STUDENT">Get Started</Link>
          </Button>
         <Button
  asChild
  size="lg"
  variant="outline"
  className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-white"
>
  <Link href="/auth">View Demo</Link>
</Button>
        </div>

        <p className="mt-4 text-xs text-zinc-600">Team Unique Brains</p>
      </div>
    </section>
  );
};

export default Hero;