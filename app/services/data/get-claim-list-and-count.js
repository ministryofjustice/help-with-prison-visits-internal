const moment = require('moment')
const { Promise } = require('bluebird')
const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')
const statusFormatter = require('../claim-status-formatter')
const claimStatusEnum = require('../../constants/claim-status-enum')
const getClosedClaimStatus = require('./get-closed-claim-status')

module.exports = (status, advanceClaims, offset, limit, user, sortType, sortOrder) => {
  const currentDateTime = dateFormatter.now().toDate()
  const db = getDatabaseConnector()

  const subquery = db('Claim')
    .whereNull('AssignedTo')
    .orWhere('AssignedTo', '=', user)
    .orWhere('AssignmentExpiry', '<', currentDateTime)
    .select('ClaimId')

  return db('Claim')
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
    .whereIn('Claim.Status', status)
    .andWhere('Claim.IsAdvanceClaim', advanceClaims)
    .andWhere('ClaimId', 'in', subquery)
    .count('Claim.ClaimId AS Count')
    .then(count => {
      return db('Claim')
        .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
        .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
        .whereIn('Claim.Status', status)
        .andWhere('Claim.IsAdvanceClaim', advanceClaims)
        .andWhere('ClaimId', 'in', subquery)
        .select(
          'Eligibility.Reference',
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
        .orderBy(sortType, sortOrder)
        .limit(limit)
        .offset(offset)
        .then(claims => {
          const claimsToReturn = []
          return Promise.each(claims, claim => {
            claim.DateSubmittedFormatted = moment(claim.DateSubmitted).format('DD/MM/YYYY')
            claim.DateOfJourneyFormatted = moment(claim.DateOfJourney).format('DD/MM/YYYY')
            claim.UpdatedDateFormatted = moment(claim.LastUpdated).format('DD/MM/YYYY')
            claim.DisplayStatus = statusFormatter(claim.Status)
            claim.Name = `${claim.FirstName} ${claim.LastName}`
            if (claim.Status === claimStatusEnum.APPROVED_ADVANCE_CLOSED.value) {
              return getClosedClaimStatus(claim.ClaimId).then(closedClaimStatus => {
                claim.DisplayStatus = `Closed - ${statusFormatter(closedClaimStatus)}`
                claimsToReturn.push(claim)
              })
            }
            claimsToReturn.push(claim)
            return Promise.resolve()
          }).then(() => {
            return { claims: claimsToReturn, total: count[0] }
          })
        })
    })
}
