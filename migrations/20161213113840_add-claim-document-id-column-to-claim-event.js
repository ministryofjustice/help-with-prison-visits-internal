exports.up = function (knex, Promise) {
  return knex.schema.table('ClaimEvent', function (table) {
    table.integer('ClaimDocumentId').unsigned().references('ClaimDocument.ClaimDocumentId')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('ClaimEvent', function (table) {
    table.dropColumn('ClaimDocumentId')
  })
}

