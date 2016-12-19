exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.timestamp('LastUpdated').defaultTo(knex.fn.now())
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema
    // Retrieve the name of the constraint on the LastUpdated column and remove it before dropping the column.
    .raw(
      `
        DECLARE @Constraint varchar(100);
        SET @Constraint = (
          SELECT o.name 
          FROM sysobjects o 
          INNER JOIN syscolumns c 
            ON o.id = c.cdefault 
          INNER JOIN sysobjects t 
            ON c.id = t.id 
          WHERE o.xtype = 'D' 
          AND c.name = 'LastUpdated' 
        )
        

      `
    )
    .table('Claim', function (table) {
      table.dropColumn('LastUpdated')
    })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
