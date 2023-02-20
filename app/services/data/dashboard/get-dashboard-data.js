const getAutoApprovedClaimCount = require('../../../services/data/dashboard/get-auto-approved-claim-count')
const getInProgressClaimCount = require('../../../services/data/dashboard/get-in-progress-claim-count')
const getManuallyApprovedClaimCount = require('../../../services/data/dashboard/get-manually-approved-claim-count')
const getPaidClaimCount = require('../../../services/data/dashboard/get-paid-claim-count')
const getPendingClaimCount = require('../../../services/data/dashboard/get-pending-claim-count')
const getRejectedClaimCount = require('../../../services/data/dashboard/get-rejected-claim-count')

module.exports = function (filter) {
  const promises = []
  let pendingCount = 0
  let inProgressCount = 0
  let paidCount = 0
  let autoApprovedCount = 0
  let manuallyApprovedCount = 0
  let rejectedCount = 0

  promises.push(getAutoApprovedClaimCount(filter).then(function (result) { autoApprovedCount = result[0].Count }))
  promises.push(getInProgressClaimCount(filter).then(function (result) { inProgressCount = result[0].Count }))
  promises.push(getManuallyApprovedClaimCount(filter).then(function (result) { manuallyApprovedCount = result[0].Count }))
  promises.push(getPaidClaimCount(filter).then(function (result) { paidCount = result[0].Count }))
  promises.push(getPendingClaimCount(filter).then(function (result) { pendingCount = result[0].Count }))
  promises.push(getRejectedClaimCount(filter).then(function (result) { rejectedCount = result[0].Count }))

  return Promise.all(promises)
    .then(function () {
      return {
        autoApproved: autoApprovedCount,
        inProgress: inProgressCount,
        manuallyApproved: manuallyApprovedCount,
        paid: paidCount,
        pending: pendingCount,
        rejected: rejectedCount
      }
    })
}
