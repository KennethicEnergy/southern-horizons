-- Positions replace the old roles. The admin becomes President; everyone else becomes
-- Member until the President assigns their position under Backoffice → Members.
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
UPDATE "users" SET "role" = CASE WHEN "role" = 'admin' THEN 'president' ELSE 'member' END;--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('president', 'vpExternal', 'vpInternal', 'communications', 'creativesTeam', 'orgDevelopment', 'donorSponsorRelations', 'bookkeeper', 'member');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'member';--> statement-breakpoint
CREATE TYPE "public"."approval_action" AS ENUM('add', 'edit', 'delete');--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "approval_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" uuid NOT NULL,
	"action" "approval_action" NOT NULL,
	"payload" jsonb,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"requested_by_id" uuid NOT NULL,
	"requested_role" "role" NOT NULL,
	"approver_roles" "role"[] NOT NULL,
	"reviewed_by_id" uuid,
	"reviewed_at" timestamp with time zone,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_requested_by_id_users_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "approval_requests_status_idx" ON "approval_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "approval_requests_resource_idx" ON "approval_requests" USING btree ("resource_type","resource_id");
