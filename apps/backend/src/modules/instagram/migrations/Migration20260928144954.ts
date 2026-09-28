import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260928144954 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "instagram_state" ("id" text not null, "token" text null, "expires_at" timestamptz null, "refreshed_at" timestamptz null, "next_refresh_at" timestamptz null, "reels" jsonb null, "fetched_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "instagram_state_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_instagram_state_deleted_at" ON "instagram_state" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "instagram_state" cascade;`);
  }

}
