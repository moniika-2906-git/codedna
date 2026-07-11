"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isRecruiterView = pathname?.startsWith("/dashboard");

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-black/80 backdrop-blur sticky top-0 z-40">
      <Link href="/" className="text-lg font-bold text-white">
        Code<span className="text-purple-400">DNA</span>
      </Link>

      <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-full p-1">
        <Link
          href="/problems"
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
            !isRecruiterView
              ? "bg-purple-600 text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Student View
        </Link>
        <Link
          href="/dashboard"
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
            isRecruiterView
              ? "bg-purple-600 text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Recruiter View
        </Link>
      </div>
    </nav>
  );
}