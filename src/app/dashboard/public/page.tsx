import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PromptCard } from "@/components/PromptCard";
import { PromptsListPublic } from "./PromptsListPublic";

export default async function PublicPromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { q, sort } = await searchParams;

  const prompts = await prisma.prompt.findMany({
    where: { isPublic: true },
    orderBy: sort === "title" ? { title: "asc" } : { updatedAt: "desc" },
    take: 50,
  });

  const filtered = q
    ? prompts.filter(
        (p) =>
          p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.content.toLowerCase().includes(q.toLowerCase())
      )
    : prompts;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Публичные медитации</h1>
      <p className="mt-2 text-muted-foreground">
        Медитации, которые другие пользователи сделали публичными
      </p>
      <PromptsListPublic
        prompts={filtered}
        userId={session.user.id}
        searchQuery={q}
        sort={sort}
      />
    </div>
  );
}
