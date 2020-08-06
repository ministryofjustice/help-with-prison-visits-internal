exports.up = function (knex, Promise) {
  return knex.schema.createTable('DirectPaymentFile', function (table) {
    table.increments('PaymentFileId')
    table.string('FileType', 20).notNullable()
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
  return knex.schema.dropTable('DirectPaymentFile')
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
