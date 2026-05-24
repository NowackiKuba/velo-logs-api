CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY DEFAULT '04134fed-cbc2-4bcd-8cdd-f92b48b497f4' NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"permissions" jsonb NOT NULL,
	"status" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "id" SET DEFAULT '746b5e73-f3b5-4b20-b4dd-2453ef3a4cc2';--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DEFAULT 'e130cfbf-e09b-4587-951f-023e10588a34';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "name" varchar(55) NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "slug" varchar(55) NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "description" varchar(255);--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "project_id";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "permissions";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_slug_unique" UNIQUE("slug");