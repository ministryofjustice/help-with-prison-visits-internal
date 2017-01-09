const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const claimStatusEnum = require('../../constants/claim-status-enum')

module.exports = function (reference, claimId) {
  return knex('Claim')
    .where({'Reference': reference, 'ClaimId': claimId})
    .update({ 'Status': claimStatusEnum.REQUEST_INFO_PAYMENT, 'PaymentStatus': null })
}
