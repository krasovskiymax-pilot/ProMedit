import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>ProMedit — Заметки из PostgreSQL</h1>
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
    </main>
  );
}
