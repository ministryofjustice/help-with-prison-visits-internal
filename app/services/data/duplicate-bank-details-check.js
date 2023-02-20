const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (reference, accountNumber) {
  if (accountNumber) {
    const db = getDatabaseConnector()

    return db('ClaimBankDetail')
      .where({
        AccountNumber: accountNumber
      })
      .whereNot('Reference', reference)
      .select(
        'ClaimId',
        'Reference'
      )
      .then(function (data) {
        return data.map(function (item) {
          return {
            ClaimId: item.ClaimId,
            Reference: item.Reference
          }
        })
      })
  } else {
    Promise.resolve([])
  }
}
