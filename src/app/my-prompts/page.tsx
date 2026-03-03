import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function MyPromptsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const prompts = await prisma.prompt.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>Мои промпты</h1>
      <nav style={{ marginBottom: "1rem" }}>
        <Link href="/dashboard" style={{ marginRight: 16 }}>
          Dashboard
        </Link>
        <Link href="/">Главная</Link>
      </nav>
      {prompts.length === 0 ? (
        <p>Нет промптов. Добавьте первый.</p>
      ) : (
        <ul>
          {prompts.map((p) => (
            <li key={p.id}>
              <strong>{p.title}</strong> — {p.createdAt.toLocaleString("ru-RU")}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
