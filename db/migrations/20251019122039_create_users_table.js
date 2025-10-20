import pkg from "knex";
const { Knex } = pkg;

/**
 * @param {Knex} knex
**/
export async function up(knex) {
    await knex.schema.createTable("users", (table) => {
        table.uuid("user_id").defaultTo(knex.raw("gen_random_uuid()")).primary();
        table.string("email").unique().notNullable();
        table.string("password").notNullable();
        table.string("role").notNullable().defaultTo("GUEST");
        table.check("role IN ('MEMBER','LIBRARIAN','GUEST')");
        table.timestamp("created_at", { useTz: true }).notNullable();
    })
};

/**
 * @param {Knex} knex
**/

export async function down(knex) {
    await knex.schema.dropTableIfExists("users");
}
