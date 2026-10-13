ALTER TABLE "products" ADD COLUMN "descriptionLocales" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "products" ADD COLUMN "copyHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "product_ingredients" ADD COLUMN "locales" JSONB NOT NULL DEFAULT '{}';
