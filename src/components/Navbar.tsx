"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const viewer = useQuery(api.users.viewer);
  const { signOut } = useAuthActions();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/auth");
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-black/80 backdrop-blur sticky top-0 z-40">
      <Link href="/" className="text-lg font-bold text-white">
        Code<span className="text-purple-400">DNA</span>
      </Link>

      {viewer && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full pl-1 pr-3 py-1">
            <div className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[10px] font-semibold">
              {viewer.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <span className="text-xs text-gray-300">{viewer.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-900 text-purple-300 font-medium">
              {viewer.role}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs text-gray-400 hover:text-white transition"
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}