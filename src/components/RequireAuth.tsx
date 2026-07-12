"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

export default function RequireAuth({
  children,
  role,
}: {
  children: ReactNode;
  role: "STUDENT" | "RECRUITER";
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const viewer = useQuery(api.users.viewer, isAuthenticated ? {} : "skip");
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (viewer && viewer.role && viewer.role !== role) {
      router.push(viewer.role === "RECRUITER" ? "/dashboard" : "/problems");
    }
  }, [isLoading, isAuthenticated, viewer, role, router]);

  if (isLoading || !isAuthenticated || viewer === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (viewer?.role && viewer.role !== role) {
    return null;
  }

  return <>{children}</>;
}