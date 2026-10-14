CREATE TABLE "product_reviews" (
    "id" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_reviews_productSlug_createdAt_idx" ON "product_reviews"("productSlug", "createdAt" DESC);
