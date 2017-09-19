const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const moment = require('moment')
const dateFormatter = require('../date-formatter')
const log = require('../log')

module.exports = function (query, offset, limit) {
  log.info('get-claim-list-for-search')

  query = `%${query}%` // wrap in % for where clause

  log.info('get-claim-list-for-search query')
  log.info(query)

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
        .select('Claim.Reference', 'Visitor.FirstName', 'Visitor.LastName', 'Claim.DateSubmitted', 'Claim.DateOfJourney', 'Claim.ClaimType', 'Claim.ClaimId', 'Claim.AssignedTo', 'Claim.AssignmentExpiry')
        .orderBy('Claim.DateSubmitted', 'asc')
        .limit(limit)
        .offset(offset)
        .then(function (claims) {
          claims.forEach(function (claim) {
            log.info('get-claim-list-for-search claims.forEach')
            log.info(claim)
            claim.DateSubmittedFormatted = moment(claim.DateSubmitted).format('DD/MM/YYYY - HH:mm')
            claim.Name = claim.FirstName + ' ' + claim.LastName
            if (claim.AssignedTo && claim.AssignmentExpiry < dateFormatter.now().toDate()) {
              claim.AssignedTo = null
            }
            claim.AssignedTo = !claim.AssignedTo ? 'Unassigned' : claim.AssignedTo
          })
          return {claims: claims, total: count[0]}
        })
    })
}
