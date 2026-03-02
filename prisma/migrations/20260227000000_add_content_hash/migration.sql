-- AlterTable: add content_hash column for duplicate content detection
ALTER TABLE "dreams" ADD COLUMN "content_hash" VARCHAR(64);

-- Index for fast duplicate lookup
CREATE INDEX "dreams_content_hash_idx" ON "dreams"("content_hash");
