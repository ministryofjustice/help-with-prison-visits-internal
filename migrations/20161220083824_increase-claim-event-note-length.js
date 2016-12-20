exports.up = function (knex, Promise) {
  return knex.raw('ALTER TABLE IntSchema.ClaimEvent ALTER COLUMN Note nvarchar(2000)')
}

exports.down = function (knex, Promise) {
  return knex.raw('ALTER TABLE IntSchema.ClaimEvent ALTER COLUMN Note nvarchar(250)')
}

