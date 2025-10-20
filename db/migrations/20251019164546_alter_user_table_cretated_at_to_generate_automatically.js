import pkg from "knex";
const { Knex } = pkg;

/**
 * @param {Knex} knex
**/
export async function up(knex) {
    await knex.schema.alterTable("users", (table) => {

        table.timestamp("created_at", { useTz: true })
            .notNullable()
            .defaultTo(knex.fn.now(6))
            .alter();
    })
};

/**
 * @param {Knex} knex
**/

export async function down(knex) {
    await knex.schema.alterTable("users", (table) => {
        table.timestamp("created_at", { useTz: true }).notNullable().alter();
    })
}
