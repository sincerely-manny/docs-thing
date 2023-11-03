ALTER TABLE "invoices" ADD COLUMN "number" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN IF EXISTS "number";