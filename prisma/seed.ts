import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Создаём пользователя для заметок
  const user = await prisma.user.upsert({
    where: { email: "seed@example.com" },
    update: {},
    create: {
      email: "seed@example.com",
      name: "Seed User",
    },
  });

  await prisma.note.createMany({
    data: [
      { ownerId: user.id, title: "Первая заметка" },
      { ownerId: user.id, title: "Вторая заметка" },
      { ownerId: user.id, title: "Третья заметка" },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
