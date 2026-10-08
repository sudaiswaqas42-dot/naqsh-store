import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261008211325 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "naqsh_order_number" ("id" text not null, "sequence" serial, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "naqsh_order_number_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_naqsh_order_number_deleted_at" ON "naqsh_order_number" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "naqsh_order_number" cascade;`);
  }

}
