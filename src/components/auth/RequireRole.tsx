import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";

type Role = "STUDENT" | "RECRUITER" | "ADMIN";

interface RequireRoleProps {
  /** Roles allowed to view the wrapped content. */
  allowedRoles: Role[];
  /** Where to send an authenticated user whose role isn't allowed. */
  redirectTo: string;
  children: ReactNode;
}

/**
 * Route guard: redirects logged-out users to /auth, and authenticated
 * users whose role isn't in `allowedRoles` to `redirectTo`.
 */
export const RequireRole = ({
  allowedRoles,
  redirectTo,
  children,
}: RequireRoleProps) => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.users.viewer, isAuthenticated ? {} : "skip");
  const isViewerLoading = isAuthenticated && viewer === undefined;

  if (isLoading || isViewerLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const role = viewer?.role as Role | undefined;
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
