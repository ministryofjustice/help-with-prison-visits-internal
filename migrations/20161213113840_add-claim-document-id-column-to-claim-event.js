exports.up = function (knex, Promise) {
  return knex.schema.table('ClaimEvent', function (table) {
    table.integer('ClaimDocumentId').unsigned().references('ClaimDocument.ClaimDocumentId')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('ClaimEvent', function (table) {
    table.dropForeign('ClaimDocumentId')
    table.dropColumn('ClaimDocumentId')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

