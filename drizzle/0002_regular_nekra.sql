ALTER TABLE "clients" ADD COLUMN "number" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "client_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
