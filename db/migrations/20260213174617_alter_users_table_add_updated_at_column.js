const {Knex} = require("knex");

/**
 * @param {Knex} knex
**/

exports.up = function(knex){
   return knex.schema.alterTable("users",(table)=>{
      table.timestamp("updated_at",{useTz:true})
         .defaultTo(knex.fn.now())
   })
};

/**
 * @param {Knex} knex
**/

exports.down = function(knex){
   return knex.schema.alterTable("users",(table)=>{
      table.dropColumn("updated_at");
   })
};


