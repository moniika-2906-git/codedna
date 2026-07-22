import { Link, useLocation } from "react-router-dom";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Menu, Dna } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavUserMenu } from "./NavUserMenu";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Problems", to: "/problems" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Profile", to: "/profile" },
];

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.users.viewer, isAuthenticated ? {} : "skip");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Dna className="h-6 w-6 text-indigo-400" />
          <span className="text-lg font-semibold tracking-tight text-zinc-100">
            CodeDNA
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-indigo-400"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <NavUserMenu name={viewer?.name} email={viewer?.email} />
          ) : (
            <Button
              asChild
              className="bg-indigo-500 text-zinc-50 hover:bg-indigo-400"
            >
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="border-zinc-800 bg-zinc-950 text-zinc-100"
          >
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-zinc-100">
                <Dna className="h-5 w-5 text-indigo-400" />
                CodeDNA
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-zinc-900 text-indigo-400"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 border-t border-zinc-800 pt-6">
              {isAuthenticated ? (
                <NavUserMenu
                  name={viewer?.name}
                  email={viewer?.email}
                  fullWidth
                />
              ) : (
                <Button
                  asChild
                  className="w-full bg-indigo-500 text-zinc-50 hover:bg-indigo-400"
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
