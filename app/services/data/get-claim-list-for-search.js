const moment = require('moment')
const { Promise } = require('bluebird')
const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')
const statusFormatter = require('../claim-status-formatter')
const claimStatusEnum = require('../../constants/claim-status-enum')
const getClosedClaimStatus = require('./get-closed-claim-status')

module.exports = (query, offset, limit) => {
  query = `%${query}%` // wrap in % for where clause
  const db = getDatabaseConnector()

  return db('Claim')
    .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
    .join('Prisoner', 'Claim.EligibilityId', '=', 'Prisoner.EligibilityId')
    .where('Claim.Reference', 'like', query)
    .orWhere('Visitor.NationalInsuranceNumber', 'like', query)
    .orWhereRaw(`CONCAT(Visitor.FirstName, ' ', Visitor.LastName) like '${query}'`)
    .orWhere('Prisoner.PrisonNumber', 'like', query)
    .count('Claim.ClaimId AS Count')
    .then(count => {
      return db('Claim')
        .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
        .join('Prisoner', 'Claim.EligibilityId', '=', 'Prisoner.EligibilityId')
        .where('Claim.Reference', 'like', query)
        .orWhere('Visitor.NationalInsuranceNumber', 'like', query)
        .orWhereRaw(`CONCAT(Visitor.FirstName, ' ', Visitor.LastName) like '${query}'`)
        .orWhere('Prisoner.PrisonNumber', 'like', query)
        .select(
          'Claim.Reference',
          'Visitor.FirstName',
          'Visitor.LastName',
          'Claim.DateSubmitted',
          'Claim.DateOfJourney',
          'Claim.ClaimType',
          'Claim.ClaimId',
          'Claim.AssignedTo',
          'Claim.AssignmentExpiry',
          'Claim.Status',
          'Claim.LastUpdated',
        )
        .orderBy('Claim.DateSubmitted', 'asc')
        .offset(offset)
        .then(claims => {
          const claimsToReturn = []
          return Promise.each(claims, claim => {
            claim.DateSubmittedFormatted = moment(claim.DateSubmitted).format('DD/MM/YYYY - HH:mm')
            claim.DateOfJourneyFormatted = moment(claim.DateOfJourney).format('DD/MM/YYYY')
            claim.DisplayStatus = statusFormatter(claim.Status)
            claim.Name = `${claim.FirstName} ${claim.LastName}`
            if (claim.AssignedTo && claim.AssignmentExpiry < dateFormatter.now().toDate()) {
              claim.AssignedTo = null
            }
            claim.AssignedTo = !claim.AssignedTo ? 'Unassigned' : claim.AssignedTo
            if (claim.Status === claimStatusEnum.APPROVED_ADVANCE_CLOSED.value) {
              return getClosedClaimStatus(claim.ClaimId).then(status => {
                claim.DisplayStatus = `Closed - ${statusFormatter(status)}`
                claimsToReturn.push(claim)
              })
            }
            claimsToReturn.push(claim)
            return Promise.resolve()
          }).then(() => {
            return { claims: claimsToReturn.slice(0, limit), total: count[0] }
          })
        })
    })
}
