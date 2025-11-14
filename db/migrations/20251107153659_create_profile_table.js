const {Knex} = require("knex");
/**
 * @param {Knex} knex
 **/

exports.up = function(knex){
   return knex.schema.createTable("profiles",(table)=>{
      table.uuid("user_id").primary().references("user_id").inTable("users").notNullable();
      table.string("user_name", 20); //represent user custom username
      table.string("first_name", 20); // represent user first name
      table.string("last_name", 20); // represent user last name
      table.string("contact", 17); // represent user contact number
      table.text("address"); // represnt user home address
      table.timestamp("membership_date"); // represent user membership date (if null, not a member)
      table.string("status",10).defaultTo("ACTIVE").notNullable(); // represent user status, (active, suspended, banned)
      table.check("status in ('ACTIVE','SUSPENDED','BANNED')");
      table.decimal("total_fines",10,2).notNullable().defaultTo(0.00); // user total fines in usd
      table.timestamp("updated_at"); // represent user data last profile updates
   })
}
/**
 * @param {Knex} knex
 **/
exports.down = function(knex){
   return knex.schema.dropTableIfExists("profiles");
}
