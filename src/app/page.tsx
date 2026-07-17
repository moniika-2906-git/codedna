// import Link from "next/link";

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-black text-white">
//       {/* Navbar */}
//       <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-800">
//         <span className="text-xl font-bold">CodeDNA</span>
//         <span className="text-sm text-gray-400">Team Unique Brains</span>
//       </nav>

//       {/* Hero Section */}
//       <section className="flex flex-col items-center text-center px-6 py-24">
//         <span className="text-sm tracking-widest text-purple-400 mb-4">
//           POWERED BY MICROSOFT AZURE
//         </span>
//         <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
//           Code<span className="text-purple-500">DNA</span>
//         </h1>
//         <p className="text-xl text-gray-300 max-w-2xl mb-2">
//           India&apos;s First Agentic Coding Assessment Platform
//         </p>
//         <p className="text-lg text-gray-500 max-w-xl mb-10">
//           Don&apos;t ban AI. Measure how well engineers use it.
//         </p>

//         <div className="flex gap-4">
//           <Link href="/auth?flow=signUp&role=STUDENT" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition">
//             Get Started
//           </Link>
//           <Link href="/auth" className="border border-gray-600 hover:border-gray-400 px-6 py-3 rounded-lg font-medium transition">
//             View Demo
//           </Link>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-16 max-w-5xl mx-auto">
//         <StatCard number="1.5M+" label="Engineering graduates/yr in India" />
//         <StatCard number="0" label="Indian agentic assessment platforms" />
//         <StatCard number="40K+" label="Engineering colleges as market" />
//       </section>

//       {/* Features Row */}
//       <section className="flex flex-wrap justify-center gap-8 px-8 py-16 border-t border-gray-800">
//         <Feature label="Prompt Tracking" />
//         <Feature label="Engineering DNA" />
//         <Feature label="Interview Replay" />
//         <Feature label="Campus Hiring" />
//         <Feature label="Real Projects" />
//       </section>

//       {/* Footer */}
//       <footer className="text-center text-gray-500 text-sm py-8 border-t border-gray-800">
//         Cognitive Chaos 2026 · Microsoft Office, Sovereign Noida
//       </footer>
//     </main>
//   );
// }

// function StatCard({ number, label }: { number: string; label: string }) {
//   return (
//     <div className="bg-gray-900 rounded-xl p-6 text-center border border-gray-800">
//       <div className="text-3xl font-bold text-purple-400 mb-2">{number}</div>
//       <div className="text-gray-400 text-sm">{label}</div>
//     </div>
//   );
// }

// function Feature({ label }: { label: string }) {
//   return (
//     <div className="bg-gray-900 border border-gray-800 rounded-full px-5 py-2 text-sm text-gray-300">
//       {label}
//     </div>
//   );
// }

import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}