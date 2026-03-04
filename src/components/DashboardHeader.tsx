"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { signOut } from "next-auth/react";

type UserProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function DashboardHeader({ user }: { user: UserProps }) {
  const displayName = user?.name || user?.email || "Пользователь";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-end border-b border-border bg-background px-6">
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
          {user?.image ? (
            <Image
              src={user.image}
              alt={displayName}
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <span className="text-sm font-medium">{displayName}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Выйти
        </button>
      </div>
    </header>
  );
}
