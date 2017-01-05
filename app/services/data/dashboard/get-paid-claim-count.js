const config = require('../../../../knexfile').intweb
const knex = require('knex')(config)
const claimStatusEnum = require('../../../../app/constants/claim-status-enum')
const applyFilter = require('./apply-filter')

module.exports = function (filter) {
  return applyFilter(
      knex('Claim')
        .count('ClaimId AS Count')
        .where(function () {
          // For Advance Claims
          this.where(function () {
            this.where({
              'IsAdvanceClaim': true,
              'Status': claimStatusEnum.APPROVED_ADVANCE_CLOSED.value
            })
          })
          // For normal claims
          .orWhere(function () {
            this.where('IsAdvanceClaim', false)
              .whereIn('Status', [ claimStatusEnum.APPROVED.value, claimStatusEnum.AUTOAPPROVED.value ])
          })
        }),
      filter
    )
}
