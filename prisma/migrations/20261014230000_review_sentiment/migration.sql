CREATE TYPE "ReviewSentiment" AS ENUM ('positive', 'negative', 'held');

ALTER TABLE "product_reviews" ADD COLUMN "sentiment" "ReviewSentiment" NOT NULL DEFAULT 'held';
ALTER TABLE "product_reviews" ADD COLUMN "note" TEXT NOT NULL DEFAULT '';

CREATE INDEX "product_reviews_sentiment_createdAt_idx" ON "product_reviews"("sentiment", "createdAt" DESC);
