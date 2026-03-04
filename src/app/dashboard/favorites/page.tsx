import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PromptCard } from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function FavoritesPage({
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
    where: { ownerId: session.user.id, isFavorite: true },
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
      <h1 className="text-3xl font-bold">Избранное</h1>
      <p className="mt-2 text-muted-foreground">
        Ваши избранные медитации
      </p>
      {prompts.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">Нет избранных медитаций</p>
          <Button className="mt-4" asChild>
            <a href="/dashboard">
              <Plus className="mr-2 h-4 w-4" />
              Перейти к моим медитациям
            </a>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              isOwner={prompt.ownerId === session.user!.id!}
            />
          ))}
        </div>
      )}
    </div>
  );
}
