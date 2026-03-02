import { PrismaClient } from "@prisma/client";

export type DbTarget = "local" | "working";

export function getDatabaseUrl(target: DbTarget): string {
  if (target === "working" && process.env.DATABASE_URL_WORKING) {
    return process.env.DATABASE_URL_WORKING;
  }
  return process.env.DATABASE_URL!;
}

const clients = new Map<string, PrismaClient>();

export function getViewDbClient(target: DbTarget): PrismaClient {
  const url = getDatabaseUrl(target);
  if (!clients.has(url)) {
    clients.set(
      url,
      new PrismaClient({
        datasources: { db: { url } },
      })
    );
  }
  return clients.get(url)!;
}
