DO $$ BEGIN
 CREATE TYPE "clienttype" AS ENUM('ИП', 'ООО', 'АО', 'ПАО', 'ФЛ');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "clienttype" NOT NULL,
	"name" varchar NOT NULL,
	"ogrn" varchar(13),
	"inn" varchar,
	"email" varchar
);
