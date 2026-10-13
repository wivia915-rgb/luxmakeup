CREATE TABLE "product_ingredients" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "benefit" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'leaf',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_ingredients_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_ingredients_productId_sortOrder_idx" ON "product_ingredients"("productId", "sortOrder");

ALTER TABLE "product_ingredients" ADD CONSTRAINT "product_ingredients_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "product_ingredients" ("id", "productId", "name", "benefit", "icon", "sortOrder")
SELECT
    md5(p."id" || ':' || t.ingredient || ':' || t.ordinality::text),
    p."id",
    t.ingredient,
    '',
    (ARRAY['droplet', 'spark', 'leaf', 'sun', 'gem', 'flower'])[((t.ordinality - 1) % 6) + 1],
    (t.ordinality - 1)::int
FROM "products" p
CROSS JOIN LATERAL unnest(p."ingredients") WITH ORDINALITY AS t(ingredient, ordinality);
