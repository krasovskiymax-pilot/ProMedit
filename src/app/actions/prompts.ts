"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const promptSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен").max(200),
  content: z.string().min(1, "Содержимое обязательно"),
  isPublic: z.boolean(),
});

export type PromptFormState = {
  error?: string;
  success?: boolean;
};

export async function createPrompt(
  _prev: PromptFormState,
  formData: FormData
): Promise<PromptFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Необходима авторизация" };
  }

  const parsed = promptSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
    isPublic: formData.get("isPublic") === "true",
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Ошибка валидации" };
  }

  try {
    await prisma.prompt.create({
      data: {
        ownerId: session.user.id,
        title: parsed.data.title,
        content: parsed.data.content,
        isPublic: parsed.data.isPublic,
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/public");
    revalidatePath("/dashboard/favorites");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ошибка создания" };
  }
}

export async function updatePrompt(
  id: string,
  _prev: PromptFormState,
  formData: FormData
): Promise<PromptFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Необходима авторизация" };
  }

  const parsed = promptSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
    isPublic: formData.get("isPublic") === "true",
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Ошибка валидации" };
  }

  try {
    const existing = await prisma.prompt.findFirst({
      where: { id, ownerId: session.user.id },
    });
    if (!existing) {
      return { error: "Медитация не найдена или нет доступа" };
    }

    await prisma.prompt.update({
      where: { id },
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        isPublic: parsed.data.isPublic,
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/public");
    revalidatePath("/dashboard/favorites");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ошибка обновления" };
  }
}

export async function deletePrompt(id: string): Promise<PromptFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Необходима авторизация" };
  }

  try {
    const existing = await prisma.prompt.findFirst({
      where: { id, ownerId: session.user.id },
    });
    if (!existing) {
      return { error: "Медитация не найдена или нет доступа" };
    }

    await prisma.prompt.delete({ where: { id } });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/public");
    revalidatePath("/dashboard/favorites");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ошибка удаления" };
  }
}

export async function togglePublic(id: string): Promise<PromptFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Необходима авторизация" };
  }

  try {
    const existing = await prisma.prompt.findFirst({
      where: { id, ownerId: session.user.id },
    });
    if (!existing) {
      return { error: "Медитация не найдена или нет доступа" };
    }

    await prisma.prompt.update({
      where: { id },
      data: { isPublic: !existing.isPublic },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/public");
    revalidatePath("/dashboard/favorites");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ошибка" };
  }
}

export async function toggleFavorite(id: string): Promise<PromptFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Необходима авторизация" };
  }

  try {
    const existing = await prisma.prompt.findFirst({
      where: { id, ownerId: session.user.id },
    });
    if (!existing) {
      return { error: "Медитация не найдена или нет доступа" };
    }

    await prisma.prompt.update({
      where: { id },
      data: { isFavorite: !existing.isFavorite },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/public");
    revalidatePath("/dashboard/favorites");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ошибка" };
  }
}
