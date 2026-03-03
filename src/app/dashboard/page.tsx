import { auth } from "@/auth";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>Dashboard</h1>
      <p>
        Вы вошли как <strong>{session.user.email}</strong>
      </p>
      <nav style={{ marginTop: "1rem" }}>
        <Link href="/my-prompts" style={{ marginRight: 16 }}>
          Мои промпты
        </Link>
        <Link href="/" style={{ marginRight: 16 }}>
          Главная
        </Link>
        <SignOutButton />
      </nav>
    </main>
  );
}
