"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPrompt, updatePrompt } from "@/app/actions/prompts";
import type { Prompt } from "@prisma/client";

export function PromptDialog({
  open,
  onOpenChange,
  prompt,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: Prompt | null;
  onSuccess?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const isEdit = !!prompt;

  useEffect(() => {
    if (open) {
      setTitle(prompt?.title ?? "");
      setContent(prompt?.content ?? "");
      setIsPublic(prompt?.isPublic ?? false);
      setError(null);
    }
  }, [open, prompt]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("content", content);
    formData.set("isPublic", String(isPublic));

    const result = isEdit
      ? await updatePrompt(prompt!.id, {}, formData)
      : await createPrompt({}, formData);

    setIsPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактировать медитацию" : "Создать медитацию"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название медитации"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Содержимое</Label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Текст медитации"
              required
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="isPublic">Публичный</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
