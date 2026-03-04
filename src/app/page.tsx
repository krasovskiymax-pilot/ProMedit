import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>ProMedit — Заметки из PostgreSQL</h1>
      {session?.user ? (
        <p>
          <Link href="/dashboard">Dashboard</Link> |{" "}
          <Link href="/my-prompts">Мои медитации</Link>
        </p>
      ) : (
        <p>
          <Link href="/login">Войти через Google</Link>
        </p>
      )}
      <p>Данные загружены из NeonDB (PostgreSQL):</p>
      <ul style={{ marginTop: "1rem" }}>
        {notes.length === 0 ? (
          <li>Нет заметок. Выполните: <code>npx prisma db seed</code></li>
        ) : (
          notes.map((note) => (
            <li key={note.id}>
              <strong>{note.title}</strong> —{" "}
              {note.createdAt.toLocaleString("ru-RU")}
            </li>
          ))
        )}
      </ul>
      <p style={{ marginTop: "2rem" }}>
        <Link href="/view-db">view-db</Link> — просмотр БД и CRUD
      </p>
    </main>
  );
}
