const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const moment = require('moment')
const dateFormatter = require('../date-formatter')
const statusFormatter = require('../claim-status-formatter')
const claimStatusEnum = require('../../constants/claim-status-enum')
const Promise = require('bluebird').Promise
const getClosedClaimStatus = require('./get-closed-claim-status')

module.exports = function (status, advanceClaims, offset, limit, user, sortType, sortOrder) {
  var currentDateTime = dateFormatter.now().toDate()
  var subquery = knex('Claim')
    .whereNull('AssignedTo')
    .orWhere('AssignedTo', '=', user)
    .orWhere('AssignmentExpiry', '<', currentDateTime)
    .select('ClaimId')

  return knex('Claim')
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
    .whereIn('Claim.Status', status)
    .andWhere('Claim.IsAdvanceClaim', advanceClaims)
    .andWhere('ClaimId', 'in', subquery)
    .count('Claim.ClaimId AS Count')
    .then(function (count) {
      return knex('Claim')
        .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
        .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
        .whereIn('Claim.Status', status)
        .andWhere('Claim.IsAdvanceClaim', advanceClaims)
        .andWhere('ClaimId', 'in', subquery)
        .select('Eligibility.Reference', 'Visitor.FirstName', 'Visitor.LastName', 'Claim.DateSubmitted', 'Claim.DateOfJourney', 'Claim.ClaimType', 'Claim.ClaimId', 'Claim.AssignedTo', 'Claim.AssignmentExpiry', 'Claim.Status', 'Claim.LastUpdated')
        .orderBy(sortType, sortOrder)
        .limit(limit)
        .offset(offset)
        .then(function (claims) {
          var claimsToReturn = []
          return Promise.each(claims, function (claim) {
            claim.DateSubmittedFormatted = moment(claim.DateSubmitted).format('DD/MM/YYYY - HH:mm')
            claim.DateOfJourneyFormatted = moment(claim.DateOfJourney).format('DD/MM/YYYY')
            claim.UpdatedDateFormatted = moment(claim.LastUpdated).format('DD/MM/YYYY - HH:mm')
            claim.DisplayStatus = statusFormatter(claim.Status)
            claim.Name = claim.FirstName + ' ' + claim.LastName
            if (claim.Status === claimStatusEnum.APPROVED_ADVANCE_CLOSED.value) {
              return getClosedClaimStatus(claim.ClaimId)
                .then(function (status) {
                  claim.DisplayStatus = 'Closed - ' + statusFormatter(status)
                  claimsToReturn.push(claim)
                })
            } else {
              claimsToReturn.push(claim)
              return Promise.resolve()
            }
          })
            .then(function () {
              return { claims: claimsToReturn, total: count[0] }
            })
        })
    })
}
