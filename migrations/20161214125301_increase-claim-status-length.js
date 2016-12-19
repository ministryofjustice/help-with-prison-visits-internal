exports.up = function (knex, Promise) {
  return knex.raw('ALTER TABLE IntSchema.Claim ALTER COLUMN Status nvarchar(30)')
}

exports.down = function (knex, Promise) {
  return knex.raw('ALTER TABLE IntSchema.Claim ALTER COLUMN Status nvarchar(20)')
}

