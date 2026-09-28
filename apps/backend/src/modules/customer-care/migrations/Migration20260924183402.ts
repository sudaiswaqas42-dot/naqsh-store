import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260924183402 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "newsletter_subscription" drop constraint if exists "newsletter_subscription_email_unique";`);
    this.addSql(`create table if not exists "newsletter_subscription" ("id" text not null, "email" text not null, "consented_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "newsletter_subscription_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_newsletter_subscription_email_unique" ON "newsletter_subscription" ("email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_newsletter_subscription_deleted_at" ON "newsletter_subscription" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "support_message" ("id" text not null, "name" text not null, "email" text not null, "phone" text null, "subject" text not null, "message" text not null, "status" text check ("status" in ('open', 'in_progress', 'resolved')) not null default 'open', "admin_notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "support_message_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_message_deleted_at" ON "support_message" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "newsletter_subscription" cascade;`);

    this.addSql(`drop table if exists "support_message" cascade;`);
  }

}
