# ProMedit — Next.js + Prisma + NeonDB

Минимальный проект, готовый к деплою на Vercel.

## Стек

- **Next.js 14** (App Router, TypeScript)
- **Prisma** (ORM)
- **NeonDB** (PostgreSQL)

## Быстрый старт

### 1. Установка зависимостей

```powershell
npm install
```

### 2. Настройка окружения

Скопируйте `.env.example` в `.env` и подставьте connection strings из [Neon Dashboard](https://neon.tech):

```powershell
Copy-Item .env.example .env
# Отредактируйте .env — вставьте DATABASE_URL и DIRECT_URL из Neon
```

### 3. Миграция базы данных

```powershell
npx prisma migrate deploy
```

### 4. Заполнение тестовыми данными (опционально)

```powershell
npm run db:seed
```

### 5. Запуск в режиме разработки

```powershell
npm run dev
```

Откройте http://localhost:3000

## Деплой на Vercel

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения в Vercel:
   - `DATABASE_URL` — pooled connection string из Neon
   - `DIRECT_URL` — direct connection string из Neon
3. В Build Command оставьте `npm run build` (уже включает `prisma generate`)
4. Перед первым деплоем выполните миграции локально или через Vercel CLI:

```powershell
npx vercel env pull .env.local
npx prisma migrate deploy
```

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Сборка для production |
| `npm run start` | Запуск production-сервера |
| `npm run db:migrate` | Применить миграции |
| `npm run db:migrate:dev` | Создать и применить миграцию (dev) |
| `npm run db:seed` | Заполнить БД тестовыми данными |
