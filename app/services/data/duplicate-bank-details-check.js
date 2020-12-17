const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (reference, accountNumber) {
  if (accountNumber) {
    return knex('ClaimBankDetail')
      .where({
        'AccountNumber': accountNumber,
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
