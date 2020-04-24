const config = require('../../../../knexfile').intweb
const knex = require('knex')(config)
const claimStatusEnum = require('../../../../app/constants/claim-status-enum')
const applyFilter = require('./apply-filter')

module.exports = function (filter) {
  return applyFilter(
    knex('Claim')
      .count('ClaimId AS Count')
      .whereIn('Status', [
        claimStatusEnum.NEW.value,
        claimStatusEnum.UPDATED.value,
        claimStatusEnum.REQUEST_INFORMATION.value,
        claimStatusEnum.REQUEST_INFO_PAYMENT.value
      ]),
    filter
  )
}
