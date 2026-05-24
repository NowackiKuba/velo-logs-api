CREATE TYPE "public"."log_level" AS ENUM('debug', 'info', 'warn', 'error', 'fatal');--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT '25f5b2aa-8bcf-49de-84b8-a692b9f9a635' NOT NULL,
	"name" varchar(55) NOT NULL,
	"env" varchar NOT NULL,
	"secret" varchar(255) NOT NULL,
	"secret_prefix" varchar(40) NOT NULL,
	"project_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"service" varchar(50) NOT NULL,
	"environment" varchar(20) DEFAULT 'production' NOT NULL,
	"level" "log_level" DEFAULT 'info' NOT NULL,
	"message" varchar(255) NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_members" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "endpoints" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "webhook_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "project_members" CASCADE;--> statement-breakpoint
DROP TABLE "endpoints" CASCADE;--> statement-breakpoint
DROP TABLE "webhook_logs" CASCADE;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DEFAULT '8373f2e2-7eac-428b-9646-aae09a4d1423';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "permissions" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "status" varchar;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_env_idx" ON "logs" USING btree ("project_id","environment");--> statement-breakpoint
CREATE INDEX "service_idx" ON "logs" USING btree ("service");--> statement-breakpoint
CREATE INDEX "level_idx" ON "logs" USING btree ("level");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "logs" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "color";