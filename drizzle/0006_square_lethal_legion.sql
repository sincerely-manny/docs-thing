ALTER TABLE "clients" ALTER COLUMN "ogrn" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_ogrn_unique" UNIQUE("ogrn");--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_inn_unique" UNIQUE("inn");