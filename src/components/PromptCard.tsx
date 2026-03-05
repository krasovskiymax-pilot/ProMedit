"use client";

import { Pencil, Trash2, Globe, Lock, Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  togglePublic,
  toggleFavorite,
  deletePrompt,
} from "@/app/actions/prompts";
import { LikeButton } from "./LikeButton";
import { useTransition, useState } from "react";
import { PromptDialog } from "./PromptDialog";
import type { Prompt } from "@prisma/client";

function previewText(text: string, maxLen = 120): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen) + "…";
}

export function PromptCard({
  prompt,
  isOwner,
  showLikeButton,
  likesCount = 0,
  likedByMe = false,
}: {
  prompt: Prompt;
  isOwner: boolean;
  showLikeButton?: boolean;
  likesCount?: number;
  likedByMe?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <h3 className="font-semibold leading-tight">{prompt.title}</h3>
        {isOwner && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditOpen(true)}
              disabled={isPending}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await togglePublic(prompt.id);
                })
              }
            >
              {prompt.isPublic ? (
                <Globe className="h-4 w-4 text-green-600" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await toggleFavorite(prompt.id);
                })
              }
            >
              <Star
                className={`h-4 w-4 ${prompt.isFavorite ? "fill-amber-400 text-amber-500" : ""}`}
              />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={isPending}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить медитацию?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground"
                    onClick={() =>
                      startTransition(async () => {
                        await deletePrompt(prompt.id);
                      })
                    }
                  >
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {previewText(prompt.content)}
        </p>
        {showLikeButton && (
          <LikeButton
            promptId={prompt.id}
            initialLiked={likedByMe}
            initialCount={likesCount}
          />
        )}
      </CardContent>
      <PromptDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        prompt={prompt}
        onSuccess={() => setEditOpen(false)}
      />
    </Card>
  );
}
