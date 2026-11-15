"use client";

import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shared/shadcn";
import { useAuth } from "@/contexts/AuthContext";
import type { AuthUser } from "@/lib/api/auth";
import { isSuperAdmin } from "@/lib/auth/access";

const initials = (u: AuthUser) =>
  `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase() || "?";

function UserSummary({ user }: { user: AuthUser }) {
  return (
    <DropdownMenuLabel className="flex items-center gap-3 p-3">
      <Avatar className="size-10">
        <AvatarFallback className="bg-primary/15 font-semibold text-primary">
          {initials(user)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate font-medium">
          {user.firstName} {user.lastName}
        </div>
        <div className="truncate text-xs font-normal text-muted-foreground">
          {user.email}
        </div>
        {isSuperAdmin(user) && (
          <Badge variant="secondary" className="mt-1">
            Super admin
          </Badge>
        )}
      </div>
    </DropdownMenuLabel>
  );
}

/** Avatar button with the account dropdown; renders nothing when logged out. */
export default function UserMenu() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
            {initials(user)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <UserSummary user={user} />
        <DropdownMenuSeparator />
        {isSuperAdmin(user) && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <ShieldCheck /> User approvals
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onSelect={() => void logout()}
          className="text-destructive focus:text-destructive"
        >
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
