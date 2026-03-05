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

  const orderBy =
    sort === "popular"
      ? { likes: { _count: "desc" as const } }
      : sort === "title"
        ? { title: "asc" as const }
        : { createdAt: "desc" as const };

  const prompts = await prisma.prompt.findMany({
    where: { isPublic: true },
    orderBy,
    take: 50,
    include: {
      _count: { select: { likes: true } },
      likes: {
        where: { userId: session.user.id },
        select: { id: true },
      },
    },
  });

  const filtered = q
    ? prompts.filter(
        (p) =>
          p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.content.toLowerCase().includes(q.toLowerCase())
      )
    : prompts;

  const promptsWithMeta = filtered.map(({ _count, likes, ...p }) => ({
    ...p,
    likesCount: _count.likes,
    likedByMe: likes.length > 0,
  }));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Публичные медитации</h1>
      <p className="mt-2 text-muted-foreground">
        Медитации, которые другие пользователи сделали публичными
      </p>
      <PromptsListPublic
        prompts={promptsWithMeta}
        userId={session.user.id}
        searchQuery={q}
        sort={sort}
      />
    </div>
  );
}
