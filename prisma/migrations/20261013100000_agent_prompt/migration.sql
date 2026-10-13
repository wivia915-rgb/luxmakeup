ALTER TABLE "store_settings" ADD COLUMN "agentEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "store_settings" ADD COLUMN "agentPrompt" TEXT NOT NULL DEFAULT '';
