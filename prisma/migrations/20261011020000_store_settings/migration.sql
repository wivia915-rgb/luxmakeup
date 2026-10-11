CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL DEFAULT 'store',
    "announcement" TEXT NOT NULL DEFAULT '',
    "freeShippingThreshold" INTEGER NOT NULL DEFAULT 0,
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "supportEmail" TEXT NOT NULL DEFAULT '',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "store_settings_threshold_check" CHECK ("freeShippingThreshold" >= 0 AND "freeShippingThreshold" <= 100000)
);
