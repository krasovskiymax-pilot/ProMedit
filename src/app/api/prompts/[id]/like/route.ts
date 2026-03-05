import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: promptId } = await params;

  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
  });

  if (!prompt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!prompt.isPublic) {
    return NextResponse.json(
      { error: "Медитация не публичная" },
      { status: 400 }
    );
  }

  if (prompt.ownerId === session.user.id) {
    return NextResponse.json(
      { error: "Нельзя лайкать свою медитацию" },
      { status: 400 }
    );
  }

  const existing = await prisma.promptLike.findUnique({
    where: {
      userId_promptId: {
        userId: session.user.id,
        promptId,
      },
    },
  });

  if (existing) {
    await prisma.promptLike.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.promptLike.create({
      data: {
        userId: session.user.id,
        promptId,
      },
    });
  }

  const likesCount = await prisma.promptLike.count({
    where: { promptId },
  });

  const liked = !existing;

  return NextResponse.json({ liked, likesCount });
}
