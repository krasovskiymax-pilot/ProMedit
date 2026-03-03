"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{
        padding: "6px 12px",
        fontSize: 14,
        cursor: "pointer",
        border: "1px solid #ccc",
        borderRadius: 4,
        background: "#f5f5f5",
      }}
    >
      Выйти
    </button>
  );
}
