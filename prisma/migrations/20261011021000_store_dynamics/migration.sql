ALTER TABLE "store_settings" ADD COLUMN "announcementAr" TEXT NOT NULL DEFAULT '';
ALTER TABLE "store_settings" ADD COLUMN "announcementFr" TEXT NOT NULL DEFAULT '';
ALTER TABLE "store_settings" ADD COLUMN "announcementEn" TEXT NOT NULL DEFAULT '';
ALTER TABLE "store_settings" ADD COLUMN "localShippingFee" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "store_settings" ADD COLUMN "standardShippingFee" INTEGER NOT NULL DEFAULT 35;
ALTER TABLE "store_settings" ADD COLUMN "remoteShippingFee" INTEGER NOT NULL DEFAULT 45;
ALTER TABLE "store_settings" ADD COLUMN "facebookPixelId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "store_settings" ADD COLUMN "tiktokPixelId" TEXT NOT NULL DEFAULT '';

UPDATE "store_settings"
SET "announcementEn" = "announcement"
WHERE "announcementEn" = '' AND "announcement" <> '';

ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_local_fee_check" CHECK ("localShippingFee" >= 0 AND "localShippingFee" <= 9999);
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_standard_fee_check" CHECK ("standardShippingFee" >= 0 AND "standardShippingFee" <= 9999);
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_remote_fee_check" CHECK ("remoteShippingFee" >= 0 AND "remoteShippingFee" <= 9999);
