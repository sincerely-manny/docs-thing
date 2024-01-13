CREATE TABLE IF NOT EXISTS "services_lib" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text,
	"price" numeric(20, 2)
);
--> statement-breakpoint
ALTER TABLE "services" RENAME COLUMN "description" TO "title";--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_client_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_invoice_id_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "services" DROP CONSTRAINT "services_invoice_id_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "amount" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "price" numeric(20, 2);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "services" ADD CONSTRAINT "services_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
