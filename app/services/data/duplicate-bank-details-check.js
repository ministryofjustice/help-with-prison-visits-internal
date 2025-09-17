const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = (reference, accountNumber) => {
  if (accountNumber) {
    const db = getDatabaseConnector()

    return db('ClaimBankDetail')
      .where({
        AccountNumber: accountNumber,
      })
      .whereNot('Reference', reference)
      .select('ClaimId', 'Reference')
      .then(data => {
        return data.map(item => {
          return {
            ClaimId: item.ClaimId,
            Reference: item.Reference,
          }
        })
      })
  }
  return Promise.resolve([])
}
