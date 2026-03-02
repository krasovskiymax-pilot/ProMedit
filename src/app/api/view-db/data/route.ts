import { NextRequest, NextResponse } from "next/server";
import { getViewDbClient, type DbTarget } from "@/lib/prisma-view";

const PAGE_SIZE = 10;

function sanitizeName(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error("Invalid name");
  }
  return name;
}

function sanitizeTableName(name: string): string {
  return sanitizeName(name);
}

export async function GET(req: NextRequest) {
  const target = (req.nextUrl.searchParams.get("db") || "local") as DbTarget;
  const table = req.nextUrl.searchParams.get("table");
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10));
  if (!table) {
    return NextResponse.json({ error: "Missing table" }, { status: 400 });
  }
  try {
    const safeTable = sanitizeTableName(table);
    const prisma = getViewDbClient(target);
    const offset = (page - 1) * PAGE_SIZE;
    const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
      `SELECT COUNT(*)::bigint as count FROM "${safeTable}"`
    );
    const total = Number(countResult[0]?.count ?? 0);
    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "${safeTable}" ORDER BY 1 LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    );
    return NextResponse.json({
      rows,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { db: target, table, row } = body as {
    db?: DbTarget;
    table?: string;
    row?: Record<string, unknown>;
  };
  if (!table || !row || typeof row !== "object") {
    return NextResponse.json({ error: "Missing table or row" }, { status: 400 });
  }
  try {
    const safeTable = sanitizeTableName(table);
    const prisma = getViewDbClient((target || "local") as DbTarget);
    const cols = Object.keys(row).filter(
      (k) =>
        row[k] !== undefined &&
        row[k] !== "" &&
        k !== "undefined" &&
        /^[A-Za-z_][A-Za-z0-9_]*$/.test(k)
    );
    const vals = cols.map((c) => row[c]);
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(", ");
    const columnNames = cols.map((c) => `"${c}"`).join(", ");
    const sql = `INSERT INTO "${safeTable}" (${columnNames}) VALUES (${placeholders}) RETURNING *`;
    const result = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(sql, ...vals);
    return NextResponse.json({ row: result[0] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { db: target, table, idColumn, idValue, row } = body as {
    db?: DbTarget;
    table?: string;
    idColumn?: string;
    idValue?: unknown;
    row?: Record<string, unknown>;
  };
  if (!table || !row || !idColumn || idValue === undefined) {
    return NextResponse.json({ error: "Missing table, row, idColumn or idValue" }, { status: 400 });
  }
  try {
    const safeTable = sanitizeTableName(table);
    const prisma = getViewDbClient((target || "local") as DbTarget);
    const cols = Object.keys(row).filter(
      (k) =>
        k !== idColumn &&
        row[k] !== undefined &&
        k !== "undefined" &&
        /^[A-Za-z_][A-Za-z0-9_]*$/.test(k)
    );
    const vals = cols.map((c) => row[c]);
    const safeIdColumn = sanitizeName(idColumn);
    const setClause = cols.map((c, i) => `"${c}" = $${i + 1}`).join(", ");
    vals.push(idValue);
    const sql = `UPDATE "${safeTable}" SET ${setClause} WHERE "${safeIdColumn}" = $${vals.length} RETURNING *`;
    const result = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(sql, ...vals);
    return NextResponse.json({ row: result[0] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { db: target, table, idColumn, idValue } = body as {
    db?: DbTarget;
    table?: string;
    idColumn?: string;
    idValue?: unknown;
  };
  if (!table || !idColumn || idValue === undefined) {
    return NextResponse.json({ error: "Missing table, idColumn or idValue" }, { status: 400 });
  }
  try {
    const safeTable = sanitizeTableName(table);
    const prisma = getViewDbClient((target || "local") as DbTarget);
    const safeIdColumn = sanitizeName(idColumn);
    const sql = `DELETE FROM "${safeTable}" WHERE "${safeIdColumn}" = $1 RETURNING *`;
    const result = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      sql,
      typeof idValue === "string" ? idValue : String(idValue)
    );
    return NextResponse.json({ deleted: result[0] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
