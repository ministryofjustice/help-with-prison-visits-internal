exports.up = function (knex, Promise) {
  return knex.schema.createTable('PayoutPaymentFile', function (table) {
    table.increments('PayoutPaymentFileId')
    table.dateTime('DateCreated').notNullable()
    table.string('Filepath', 250).notNullable()
    table.boolean('IsEnabled').defaultTo(true)
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('PayoutPaymentFile')
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
