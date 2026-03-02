/**
 * Скрипт проверки: создаёт тестового пользователя, медитацию и голос.
 * Запуск: npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/verify.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Проверка схемы БД...\n");

  // 1. Тестовый пользователь
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Тестовый Пользователь",
    },
  });
  console.log("✓ Пользователь:", user.email, `(id: ${user.id})`);

  // 2. Категория (нужна для медитации)
  const category = await prisma.category.upsert({
    where: { id: "verify-category-1" },
    update: {},
    create: {
      id: "verify-category-1",
      category: "Релаксация",
    },
  });
  console.log("✓ Категория:", category.category);

  // 3. Тестовая медитация (публичная, чтобы можно было голосовать)
  const meditation = await prisma.meditation.upsert({
    where: { id: "verify-meditation-1" },
    update: {},
    create: {
      id: "verify-meditation-1",
      ownerId: user.id,
      title: "Тестовая медитация",
      content: "Содержимое тестовой медитации...",
      description: "Создана скриптом проверки",
      categoryId: category.id,
      visibility: "PUBLIC",
    },
  });
  console.log("✓ Медитация:", meditation.title);

  // 4. Тестовый голос
  const vote = await prisma.vote.upsert({
    where: {
      userId_meditationId: {
        userId: user.id,
        meditationId: meditation.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      meditationId: meditation.id,
      value: 1,
    },
  });
  console.log("✓ Голос: value =", vote.value);

  console.log("\nПроверка завершена успешно.");
}

main()
  .catch((e) => {
    console.error("Ошибка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
