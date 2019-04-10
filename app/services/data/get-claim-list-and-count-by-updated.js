const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const moment = require('moment')
const dateFormatter = require('../date-formatter')
const statusFormatter = require('../claim-status-formatter')

module.exports = function (status, advanceClaims, offset, limit, user) {
  var currentDateTime = dateFormatter.now().toDate()
  var subquery = knex('Claim')
    .whereNull('AssignedTo')
    .orWhere('AssignedTo', '=', user)
    .orWhere('AssignmentExpiry', '<', currentDateTime)
    .select('ClaimId')

  return knex('Claim')
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
    .where({'Claim.Status': status, 'Claim.IsAdvanceClaim': advanceClaims})
    .andWhere('ClaimId', 'in', subquery)
    .count('Claim.ClaimId AS Count')
    .then(function (count) {
      return knex('Claim')
        .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
        .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
        .where({'Claim.Status': status, 'Claim.IsAdvanceClaim': advanceClaims})
        .andWhere('ClaimId', 'in', subquery)
        .select('Eligibility.Reference', 'Visitor.FirstName', 'Visitor.LastName', 'Claim.DateSubmitted', 'Claim.DateOfJourney', 'Claim.ClaimType', 'Claim.ClaimId', 'Claim.AssignedTo', 'Claim.AssignmentExpiry', 'Claim.Status', 'Claim.LastUpdated')
        .orderBy('Claim.LastUpdated', 'desc')
        .limit(limit)
        .offset(offset)
        .then(function (claims) {
          claims.forEach(function (claim) {
            claim.DateSubmittedFormatted = moment(claim.DateSubmitted).format('DD/MM/YYYY - HH:mm')
            claim.DateOfJourneyFormatted = moment(claim.DateOfJourney).format('DD/MM/YYYY')
            claim.DisplayStatus = statusFormatter(claim.Status)
            claim.Name = claim.FirstName + ' ' + claim.LastName
          })
          return {claims: claims, total: count[0]}
        })
    })
}