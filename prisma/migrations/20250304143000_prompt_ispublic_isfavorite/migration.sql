-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Prompt" ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Prompt" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Prompt_ownerId_isPublic_idx" ON "Prompt"("ownerId", "isPublic");

-- CreateIndex
CREATE INDEX "Prompt_isPublic_idx" ON "Prompt"("isPublic");
