const getAutoApprovedClaimCount = require('./get-auto-approved-claim-count')
const getInProgressClaimCount = require('./get-in-progress-claim-count')
const getManuallyApprovedClaimCount = require('./get-manually-approved-claim-count')
const getPaidClaimCount = require('./get-paid-claim-count')
const getPendingClaimCount = require('./get-pending-claim-count')
const getRejectedClaimCount = require('./get-rejected-claim-count')

module.exports = filter => {
  const promises = []
  let pendingCount = 0
  let inProgressCount = 0
  let paidCount = 0
  let autoApprovedCount = 0
  let manuallyApprovedCount = 0
  let rejectedCount = 0

  promises.push(
    getAutoApprovedClaimCount(filter).then(result => {
      autoApprovedCount = result[0].Count
    }),
  )
  promises.push(
    getInProgressClaimCount(filter).then(result => {
      inProgressCount = result[0].Count
    }),
  )
  promises.push(
    getManuallyApprovedClaimCount(filter).then(result => {
      manuallyApprovedCount = result[0].Count
    }),
  )
  promises.push(
    getPaidClaimCount(filter).then(result => {
      paidCount = result[0].Count
    }),
  )
  promises.push(
    getPendingClaimCount(filter).then(result => {
      pendingCount = result[0].Count
    }),
  )
  promises.push(
    getRejectedClaimCount(filter).then(result => {
      rejectedCount = result[0].Count
    }),
  )

  return Promise.all(promises).then(() => {
    return {
      autoApproved: autoApprovedCount,
      inProgress: inProgressCount,
      manuallyApproved: manuallyApprovedCount,
      paid: paidCount,
      pending: pendingCount,
      rejected: rejectedCount,
    }
  })
}
