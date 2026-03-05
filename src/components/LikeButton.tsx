"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LikeButton({
  promptId,
  initialLiked,
  initialCount,
}: {
  promptId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      const res = await fetch(`/api/prompts/${promptId}/like`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setLiked(prevLiked);
        setCount(prevCount);
        return;
      }

      setLiked(data.liked);
      setCount(data.likesCount);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5"
      onClick={handleClick}
      disabled={loading}
    >
      <Heart
        className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
      />
      <span>{count}</span>
    </Button>
  );
}
