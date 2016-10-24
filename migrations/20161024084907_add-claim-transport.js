exports.up = function (knex, Promise) {
  return knex.schema.createTable('ClaimTransport', function (table) {
    table.increments('ClaimTransportId')
    table.integer('ClaimId').notNullable().references('Claim.ClaimId')
    table.string('TransportType', 100).notNullable()
    table.string('From', 100).notNullable()
    table.string('To', 100).notNullable()
    table.decimal('Cost').notNullable()
    table.boolean('IsReturn')
    table.integer('NumberOfDays')
    table.string('TicketType', 100)
    table.decimal('ApprovedCost')
    table.string('Note', 250)
    table.string('Status', 20)
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('ClaimTransport')
}
