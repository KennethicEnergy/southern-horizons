-- Super Admin: every permission, one holder, set only from the command line (pnpm db:super-admin).
-- users_single_holder_idx allows one Super Admin and one President among members who are not deleted.
--
-- Why a function: the index condition can't say role IN ('superAdmin', 'president') directly, because a
-- new enum value can't be used in the transaction that adds it, and it can't cast role::text because
-- that cast isn't IMMUTABLE. A plpgsql function is never inlined, so declaring it IMMUTABLE holds, and
-- it compares text inside its body. Keep its list in step with SINGLE_HOLDER_ROLES in src/config/roles.ts.
ALTER TYPE "public"."role" ADD VALUE 'superAdmin' BEFORE 'president';--> statement-breakpoint
CREATE FUNCTION "role_is_single_holder"(r "public"."role") RETURNS boolean
LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE AS $$
BEGIN
  RETURN r::text IN ('superAdmin', 'president');
END;
$$;--> statement-breakpoint
CREATE UNIQUE INDEX "users_single_holder_idx" ON "users" USING btree ("role") WHERE role_is_single_holder("users"."role") and "users"."deleted_at" is null;
