const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const moment = require('moment')
const dateFormatter = require('../date-formatter')
const statusFormatter = require('../claim-status-formatter')

module.exports = function (query, offset, limit) {
  query = `%${query}%` // wrap in % for where clause

  return knex('Claim')
    .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
    .join('Prisoner', 'Claim.EligibilityId', '=', 'Prisoner.EligibilityId')
    .where('Claim.Reference', 'like', query)
    .orWhere('Visitor.NationalInsuranceNumber', 'like', query)
    .orWhereRaw(`CONCAT(Visitor.FirstName, ' ', Visitor.LastName) like '${query}'`)
    .orWhere('Prisoner.PrisonNumber', 'like', query)
    .count('Claim.ClaimId AS Count')
    .then(function (count) {
      return knex('Claim')
        .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
        .join('Prisoner', 'Claim.EligibilityId', '=', 'Prisoner.EligibilityId')
        .where('Claim.Reference', 'like', query)
        .orWhere('Visitor.NationalInsuranceNumber', 'like', query)
        .orWhereRaw(`CONCAT(Visitor.FirstName, ' ', Visitor.LastName) like '${query}'`)
        .orWhere('Prisoner.PrisonNumber', 'like', query)
        .select('Claim.Reference', 'Visitor.FirstName', 'Visitor.LastName', 'Claim.DateSubmitted', 'Claim.DateOfJourney', 'Claim.ClaimType', 'Claim.ClaimId', 'Claim.AssignedTo', 'Claim.AssignmentExpiry', 'Claim.Status', 'Claim.LastUpdated')
        .orderBy('Claim.LastUpdated', 'dsc')
        .offset(offset)
        .then(function (claims) {
          claims.forEach(function (claim) {
            claim.DateSubmittedFormatted = moment(claim.DateSubmitted).format('DD/MM/YYYY - HH:mm')
            claim.DateOfJourneyFormatted = moment(claim.DateOfJourney).format('DD/MM/YYYY')
            claim.DisplayStatus = statusFormatter(claim.Status)
            claim.Name = claim.FirstName + ' ' + claim.LastName
            if (claim.AssignedTo && claim.AssignmentExpiry < dateFormatter.now().toDate()) {
              claim.AssignedTo = null
            }
            claim.AssignedTo = !claim.AssignedTo ? 'Unassigned' : claim.AssignedTo
          })
          return {claims: claims.slice(0, limit), total: count[0]}
        })
    })
}
