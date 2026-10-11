CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountPercentage" INTEGER,
    "fixedAmount" INTEGER,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "coupons_discount_check" CHECK (
        ("discountPercentage" IS NOT NULL AND "fixedAmount" IS NULL AND "discountPercentage" BETWEEN 1 AND 100)
        OR
        ("fixedAmount" IS NOT NULL AND "discountPercentage" IS NULL AND "fixedAmount" >= 1)
    )
);

CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");
CREATE INDEX "coupons_isActive_validUntil_idx" ON "coupons"("isActive", "validUntil");
CREATE INDEX "coupons_code_idx" ON "coupons"("code");
