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
        DECLARE @table_id AS INT
        DECLARE @name_column_id AS INT
        DECLARE @sql nvarchar(255) 
        
        -- Find table id
        SET @table_id = OBJECT_ID('IntSchema.Claim')
        
        -- Find name column id
        SELECT @name_column_id = column_id
        FROM sys.columns
        WHERE object_id = @table_id
        AND name = 'LastUpdated'
        
        -- Remove default constraint from column
        SELECT @sql = 'ALTER TABLE IntSchema.Claim DROP CONSTRAINT ' + D.name
        FROM sys.default_constraints AS D
        WHERE D.parent_object_id = @table_id
        AND D.parent_column_id = @name_column_id
        EXECUTE sp_executesql @sql
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
