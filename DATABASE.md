## Что есть в системе (сущности):

Note - заметки
User — владелец медитаций, автор, голосующий
Meditation — сама медитация (может быть приватной или публичной)
Tag — метки (многие-ко-многим с Meditation)
Vote — голос пользователя за публичную медитацию (уникально: один пользователь → один голос на медитацию)
(опционально) Collection / Folder — папки/коллекции для организации
(опционально) MeditationVersion — версии медитаций (история изменений)

## Ключевые правила:

- Публичность — это свойство Meditation (visibility)
- Голосовать можно только по публичным (проверяется на уровне приложения; можно усилить триггером/констрейнтом позже)
- Голос уникален: (userId, MeditationId) — уникальный индекс

## Схема базы данных
- Note: id, ownerId -> User, title, createdAt
- User: id (cuid), email unique, name optional, createdAt
- Meditation: id, ownerId -> User, title, content, description optional, categoryId -> Category,
  visibility (PRIVATE|PUBLIC, default PRIVATE), createdAt, updatedAt, publishedAt nullable
- Vote: id, userId -> User, MeditationId -> Meditation, value int default 1, createdAt
- Category: id, category
- Ограничение: один пользователь может проголосовать за медитацию только один раз:
  UNIQUE(userId, MeditationId)
- Индексы:
  Meditation(ownerId, updatedAt)
  Meditation(visibility, createdAt)
  Vote(MeditationId)
  Vote(userId)
- onDelete: Cascade для связей
