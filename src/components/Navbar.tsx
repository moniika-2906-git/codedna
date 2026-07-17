"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Problems", to: "/problems" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Profile", to: "/profile" },
];

const handleLogout = () => {
  console.log("Logout clicked");
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname?.startsWith(to);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Code2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight text-zinc-100">
            CodeDNA
          </span>
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.to)
                  ? "bg-zinc-800/80 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-offset-zinc-950 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-zinc-800 text-zinc-100">
                      CD
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 border-zinc-800 bg-zinc-900 text-zinc-100"
              >
                <DropdownMenuLabel className="text-zinc-400">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="cursor-pointer focus:bg-zinc-800 focus:text-zinc-100">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:bg-zinc-800 focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-64 flex-col border-zinc-800 bg-zinc-950 text-zinc-100"
            >
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-zinc-100">
                  <Code2 className="h-5 w-5 text-primary" />
                  CodeDNA
                </SheetTitle>
              </SheetHeader>

              <nav className="mt-4 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    href={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive(link.to)
                        ? "bg-zinc-800/80 text-zinc-100"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto flex items-center gap-3 border-t border-zinc-800 pt-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-zinc-800 text-zinc-100">
                    CD
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex flex-1 items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-destructive transition-colors hover:bg-zinc-800/50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
