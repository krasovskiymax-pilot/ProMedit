"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PromptCard } from "@/components/PromptCard";
import { PromptDialog } from "@/components/PromptDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { Prompt } from "@prisma/client";

export function PromptsList({
  prompts,
  userId,
  searchQuery,
  sort,
}: {
  prompts: Prompt[];
  userId: string;
  searchQuery?: string;
  sort?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState(searchQuery ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => updateSearch(value), 300);
    },
    [updateSearch]
  );

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Поиск по заголовку или содержимому..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-4"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sort ?? "updated"}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("sort", e.target.value);
              router.push(`/dashboard?${params.toString()}`);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="updated">По дате</option>
            <option value="title">По названию</option>
          </select>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Создать
          </Button>
        </div>
      </div>

      {prompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">
            {searchQuery ? "Ничего не найдено" : "Нет медитаций. Создайте первую."}
          </p>
          {!searchQuery && (
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Создать медитацию
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              isOwner={prompt.ownerId === userId}
            />
          ))}
        </div>
      )}

      <PromptDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        prompt={null}
        onSuccess={() => setCreateOpen(false)}
      />
    </div>
  );
}
