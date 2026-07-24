const {Knex}  = require("knex");

/**
 * @param {Knex} knex
 **/

exports.up = function(knex){
   return knex.schema.createTable("librarian",(table)=>{
      table.uuid("user_id").primary().references("user_id").inTable("users").notNullable();
      table.timestamp("hire_date").notNullable();;
      table.timestamp("created_at", { useTz: true }).notNullable();
   })
}

/**
 * @param {Knex} knex
 **/

exports.down = function(knex){
   return knex.schema.dropTableIfExists("librarian");
}

