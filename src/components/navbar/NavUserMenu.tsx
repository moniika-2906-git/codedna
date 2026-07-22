import { Link, useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavUserMenuProps {
  name?: string;
  email?: string;
  fullWidth?: boolean;
}

const getInitials = (name?: string, email?: string) => {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? "U";
};

export const NavUserMenu = ({ name, email, fullWidth }: NavUserMenuProps) => {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center gap-2 px-2 text-zinc-100 hover:bg-zinc-900 hover:text-zinc-100 ${
            fullWidth ? "w-full justify-start" : ""
          }`}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-indigo-500/20 text-sm font-medium text-indigo-400">
              {getInitials(name, email)}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[10rem] truncate text-sm font-medium">
            {name ?? email ?? "Account"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 border-zinc-800 bg-zinc-900 text-zinc-100"
      >
        <DropdownMenuLabel className="text-zinc-500">
          {email ?? "My Account"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          asChild
          className="cursor-pointer focus:bg-zinc-800 focus:text-zinc-100"
        >
          <Link to="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-400" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
        >
          <LogOut className="h-4 w-4 text-indigo-400" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
