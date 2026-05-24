ALTER TABLE "api_keys" ALTER COLUMN "id" SET DEFAULT '3fc4b274-0693-4be9-90f0-95a43283686c';--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DEFAULT 'eb7d3ebe-c6db-4644-ba80-f855812677d2';--> statement-breakpoint
ALTER TABLE "project_members" ALTER COLUMN "id" SET DEFAULT '405d080f-8efb-4bbe-a6c6-09ad5a068b3c';--> statement-breakpoint
ALTER TABLE "project_members" ADD COLUMN "invited_by_id" uuid;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_invited_by_id_users_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;