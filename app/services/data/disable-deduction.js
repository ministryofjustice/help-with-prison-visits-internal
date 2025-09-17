const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = deductionId => {
  const db = getDatabaseConnector()

  return db('ClaimDeduction').where('ClaimDeductionId', deductionId).returning('ClaimDeductionId').update({
    IsEnabled: false,
  })
}
