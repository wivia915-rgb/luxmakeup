-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "discountPrice" INTEGER,
    "categoryId" TEXT NOT NULL,
    "ingredients" TEXT[],
    "images" TEXT[],
    "stock" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shadeName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE INDEX "categories_name_idx" ON "categories"("name");

CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE INDEX "products_categoryId_featured_idx" ON "products"("categoryId", "featured");
CREATE INDEX "products_featured_createdAt_idx" ON "products"("featured", "createdAt" DESC);
CREATE INDEX "products_stock_idx" ON "products"("stock");
CREATE INDEX "products_title_idx" ON "products"("title");
CREATE INDEX "products_ingredients_idx" ON "products" USING GIN ("ingredients");
CREATE INDEX "products_featured_in_stock_idx" ON "products"("categoryId", "createdAt" DESC) WHERE "featured" = true AND "stock" > 0;

CREATE INDEX "orders_status_createdAt_idx" ON "orders"("status", "createdAt" DESC);
CREATE INDEX "orders_phone_idx" ON "orders"("phone");
CREATE INDEX "orders_city_status_idx" ON "orders"("city", "status");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt" DESC);
CREATE INDEX "orders_open_createdAt_idx" ON "orders"("createdAt" DESC) WHERE "status" IN ('PENDING', 'CONFIRMED');

CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");
CREATE INDEX "order_items_orderId_productId_idx" ON "order_items"("orderId", "productId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Checks
ALTER TABLE "products" ADD CONSTRAINT "products_price_nonnegative" CHECK ("price" >= 0);
ALTER TABLE "products" ADD CONSTRAINT "products_discount_below_price" CHECK ("discountPrice" IS NULL OR ("discountPrice" >= 0 AND "discountPrice" < "price"));
ALTER TABLE "products" ADD CONSTRAINT "products_stock_nonnegative" CHECK ("stock" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_total_nonnegative" CHECK ("totalAmount" >= 0);
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_unit_price_nonnegative" CHECK ("unitPrice" >= 0);
