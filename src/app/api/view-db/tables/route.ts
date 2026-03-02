import { NextRequest, NextResponse } from "next/server";
import { getViewDbClient, type DbTarget } from "@/lib/prisma-view";

export async function GET(req: NextRequest) {
  const target = (req.nextUrl.searchParams.get("db") || "local") as DbTarget;
  if (target !== "local" && target !== "working") {
    return NextResponse.json({ error: "Invalid db" }, { status: 400 });
  }
  try {
    const prisma = getViewDbClient(target);
    const result = await prisma.$queryRaw<
      { tablename: string }[]
    >`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
    const tables = result.map((r) => r.tablename).filter((t) => !t.startsWith("_prisma"));
    return NextResponse.json({ tables });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
