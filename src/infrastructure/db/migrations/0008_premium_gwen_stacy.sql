ALTER TABLE "api_keys" ALTER COLUMN "id" SET DEFAULT '1f4dba33-e160-48f2-8b09-c9dd17518996';--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DEFAULT '807df6db-313f-472b-be41-67d17d5da5cd';--> statement-breakpoint
ALTER TABLE "project_members" ALTER COLUMN "id" SET DEFAULT '4008e9ab-6c4f-49be-8053-72053e4bbbc1';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "color" varchar(7) NOT NULL;