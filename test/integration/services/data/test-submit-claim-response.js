// /* eslint-env mocha */
// const dateFormatter = require('../../../../app/services/date-formatter')
// const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')
// const claimDecisionEnum = require('../../../../app/constants/claim-decision-enum')
// const tasksEnum = require('../../../../app/constants/tasks-enum')
// const paymentMethodEnum = require('../../../../app/constants/payment-method-enum')

// const stubInsertClaimEvent = jest.fn().mockResolvedValue()
// const stubInsertTaskSendClaimNotification = jest.fn().mockResolvedValue()
// let stubUpdateRelatedClaimsRemainingOverpaymentAmount = jest.fn().mockResolvedValue()

// const submitClaimResponse = proxyquire('../../../../app/services/data/submit-claim-response', {
//   './insert-claim-event': stubInsertClaimEvent,
//   './insert-task-send-claim-notification': stubInsertTaskSendClaimNotification,
//   './update-related-claims-remaining-overpayment-amount': stubUpdateRelatedClaimsRemainingOverpaymentAmount
// })

// const reference = 'SUBC456'
// let newIds = {}
// const caseworker = 'adam@adams.gov'
// const rejectionReasonIdentifier = 1

// describe('services/data/submit-claim-response', function () {
//   beforeAll(function () {
//     return insertTestData(reference, dateFormatter.now().toDate(), 'NEW').then(function (ids) {
//       newIds = {
//         claimId: ids.claimId,
//         eligibilityId: ids.eligibilityId,
//         prisonerId: ids.prisonerId,
//         visitorId: ids.visitorId,
//         expenseId1: ids.expenseId1,
//         expenseId2: ids.expenseId2,
//         childId1: ids.childId1,
//         childId2: ids.childId2
//       }
//     })
//   })

//   it('should update remaining overpayment amounts if claim is approved', function () {
//     const claimId = newIds.claimId
//     const claimResponse = {
//       caseworker,
//       decision: claimDecisionEnum.APPROVED,
//       reason: 'No valid relationship to prisoner',
//       note: 'Could not verify in NOMIS',
//       nomisCheck: claimDecisionEnum.APPROVED,
//       dwpCheck: claimDecisionEnum.APPROVED,
//       expiryDate: dateFormatter.now().add(1, 'days'),
//       claimExpenseResponses: [
//         { claimExpenseId: newIds.expenseId1, approvedCost: '10', status: claimDecisionEnum.APPROVED },
//         { claimExpenseId: newIds.expenseId2, approvedCost: '20', status: claimDecisionEnum.REQUEST_INFORMATION }
//       ]
//     }

//     return submitClaimResponse(claimId, claimResponse)
//       .then(function () {
//         expect(stubUpdateRelatedClaimsRemainingOverpaymentAmount.calledWith(claimId, reference)).toBe(true) //eslint-disable-line
//       })
//   })

//   it('should update eligibility and claim then call to send notification', function () {
//     const claimId = newIds.claimId
//     const claimResponse = {
//       caseworker,
//       decision: claimDecisionEnum.REJECTED,
//       note: 'Could not verify in NOMIS',
//       nomisCheck: claimDecisionEnum.REJECTED,
//       dwpCheck: claimDecisionEnum.REJECTED,
//       rejectionReasonId: rejectionReasonIdentifier,
//       expiryDate: dateFormatter.now().add(1, 'days'),
//       claimExpenseResponses: [
//         { claimExpenseId: newIds.expenseId1, approvedCost: '10', status: claimDecisionEnum.REJECTED },
//         { claimExpenseId: newIds.expenseId2, approvedCost: '20', status: claimDecisionEnum.REQUEST_INFORMATION }
//       ]
//     }
//     const currentDate = dateFormatter.now()
//     const twoMinutesAgo = dateFormatter.now().minutes(currentDate.get('minutes') - 2)
//     const twoMinutesAhead = dateFormatter.now().minutes(currentDate.get('minutes') + 2)

//     return submitClaimResponse(claimId, claimResponse)
//       .then(function (result) {
//         return db('Eligibility').where('Eligibility.Reference', reference)
//           .join('Claim', 'Eligibility.EligibilityId', '=', 'Claim.EligibilityId')
//           .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
//           .join('Prisoner', 'Eligibility.EligibilityId', '=', 'Prisoner.EligibilityId')
//           .first()
//       })
//       .then(function (result) {
//         expect(result.Caseworker).toBe(caseworker)
//         // should clear assignment
//       expect(result.AssignedTo).toBeNull() //eslint-disable-line
//         // should clear assignment
//       expect(result.AssignmentExpiry).toBeNull() //eslint-disable-line
//         expect(result.Status[0]).toBe(claimDecisionEnum.REJECTED)
//         expect(result.Status[1]).toBe(claimDecisionEnum.REJECTED)
//         expect(result.Note).toBe(claimResponse.note)
//         expect(result.NomisCheck).toBe(claimDecisionEnum.REJECTED)
//         expect(result.DWPCheck).toBe(claimDecisionEnum.REJECTED)
//         expect(result.LastUpdated).toBeGreaterThanOrEqual(twoMinutesAgo.toDate())
//         expect(result.LastUpdated).toBeLessThanOrEqual(twoMinutesAhead.toDate())
//         expect(result.DateReviewed).toBeGreaterThanOrEqual(twoMinutesAgo.toDate())
//         expect(result.DateReviewed).toBeLessThanOrEqual(twoMinutesAhead.toDate())
//         expect(result.RejectionReasonId).toBe(rejectionReasonIdentifier)
//       expect(stubInsertClaimEvent.calledWith(reference, newIds.eligibilityId, newIds.claimId, `CLAIM-${claimDecisionEnum.REJECTED}`, null, claimResponse.note, caseworker, false)).toBe(true) //eslint-disable-line
//       expect(stubInsertTaskSendClaimNotification.calledWith(tasksEnum.REJECT_CLAIM_NOTIFICATION, reference, newIds.eligibilityId, newIds.claimId)).toBe(true) //eslint-disable-line
//       expect(stubUpdateRelatedClaimsRemainingOverpaymentAmount.notCalled).toBe(true) //eslint-disable-line

//         return db('ClaimExpense').where('ClaimId', newIds.claimId).select()
//       })
//       .then(function (claimExpenses) {
//         expect(claimExpenses[0].Status).toBe(claimDecisionEnum.REJECTED)
//         expect(claimExpenses[0].ApprovedCost).toBe(10)

//         expect(claimExpenses[1].Status).toBe(claimDecisionEnum.REQUEST_INFORMATION)
//         expect(claimExpenses[1].ApprovedCost).toBe(20)
//       })
//   })

//   it('should add a DateApproved if claim is approved', function () {
//     const claimId = newIds.claimId
//     const claimResponse = {
//       caseworker,
//       decision: claimDecisionEnum.APPROVED,
//       nomisCheck: claimDecisionEnum.APPROVED,
//       dwpCheck: claimDecisionEnum.APPROVED,
//       expiryDate: dateFormatter.now().add(1, 'days'),
//       note: '',
//       claimExpenseResponses: [
//         { claimExpenseId: newIds.expenseId1, approvedCost: '10', status: claimDecisionEnum.APPROVED },
//         { claimExpenseId: newIds.expenseId2, approvedCost: '20', status: claimDecisionEnum.APPROVED }
//       ]
//     }

//     return submitClaimResponse(claimId, claimResponse)
//       .then(function (result) {
//         return db('Claim').where('Claim.Reference', reference)
//           .first()
//       })
//       .then(function (result) {
//         expect(result.DateApproved).not.toBeNull() //eslint-disable-line
//       })
//   })

//   it('should set DateApproved to null if claim is rejected', function () {
//     const claimId = newIds.claimId
//     const claimResponse = {
//       caseworker,
//       decision: claimDecisionEnum.REJECTED,
//       nomisCheck: claimDecisionEnum.REJECTED,
//       dwpCheck: claimDecisionEnum.REJECTED,
//       note: '',
//       rejectionReason: rejectionReasonIdentifier,
//       expiryDate: dateFormatter.now().add(1, 'days'),
//       claimExpenseResponses: [
//         { claimExpenseId: newIds.expenseId1, approvedCost: '10', status: claimDecisionEnum.REJECTED },
//         { claimExpenseId: newIds.expenseId2, approvedCost: '20', status: claimDecisionEnum.REJECTED }
//       ]
//     }

//     return submitClaimResponse(claimId, claimResponse)
//       .then(function (result) {
//         return db('Claim').where('Claim.Reference', reference)
//           .first()
//       })
//       .then(function (result) {
//         expect(result.DateApproved).toBeNull() //eslint-disable-line
//         expect(result.RejectionReasonId).toBe(rejectionReasonIdentifier)
//       })
//   })

//   it('should set DateApproved to null if caseworker requests more information', function () {
//     const claimId = newIds.claimId
//     const claimResponse = {
//       caseworker,
//       decision: claimDecisionEnum.REQUEST_INFORMATION,
//       nomisCheck: claimDecisionEnum.REQUEST_INFORMATION,
//       dwpCheck: claimDecisionEnum.REQUEST_INFORMATION,
//       note: '',
//       expiryDate: dateFormatter.now().add(1, 'days'),
//       claimExpenseResponses: [
//         { claimExpenseId: newIds.expenseId1, approvedCost: '10', status: claimDecisionEnum.REQUEST_INFORMATION },
//         { claimExpenseId: newIds.expenseId2, approvedCost: '20', status: claimDecisionEnum.REQUEST_INFORMATION }
//       ]
//     }

//     return submitClaimResponse(claimId, claimResponse)
//       .then(function (result) {
//         return db('Claim').where('Claim.Reference', reference)
//           .first()
//       })
//       .then(function (result) {
//         expect(result.DateApproved).toBeNull() //eslint-disable-line
//       })
//   })

//   it('should set the Release Date', function () {
//     const claimId = newIds.claimId
//     const claimResponse = {
//       caseworker,
//       decision: claimDecisionEnum.REQUEST_INFORMATION,
//       nomisCheck: claimDecisionEnum.REQUEST_INFORMATION,
//       dwpCheck: claimDecisionEnum.REQUEST_INFORMATION,
//       note: '',
//       expiryDate: dateFormatter.now().add(1, 'days'),
//       claimExpenseResponses: [
//         { claimExpenseId: newIds.expenseId1, approvedCost: '10', status: claimDecisionEnum.REQUEST_INFORMATION },
//         { claimExpenseId: newIds.expenseId2, approvedCost: '20', status: claimDecisionEnum.REQUEST_INFORMATION }
//       ],
//       releaseDateIsSet: true,
//       releaseDate: dateFormatter.now().add(1, 'years')
//     }

//     return submitClaimResponse(claimId, claimResponse)
//       .then(function (result) {
//         return db('Prisoner').where('Prisoner.Reference', reference)
//           .first()
//       })
//       .then(function (result) {
//         expect(result.ReleaseDateIsSet).toBe(true)
//         expect(result.ReleaseDate).not.toBeNull() //eslint-disable-line
//       })
//   })

//   it('should not set the Release Date', function () {
//     const claimId = newIds.claimId
//     const claimResponse = {
//       caseworker,
//       decision: claimDecisionEnum.REQUEST_INFORMATION,
//       nomisCheck: claimDecisionEnum.REQUEST_INFORMATION,
//       dwpCheck: claimDecisionEnum.REQUEST_INFORMATION,
//       note: '',
//       expiryDate: dateFormatter.now().add(1, 'days'),
//       claimExpenseResponses: [
//         { claimExpenseId: newIds.expenseId1, approvedCost: '10', status: claimDecisionEnum.REQUEST_INFORMATION },
//         { claimExpenseId: newIds.expenseId2, approvedCost: '20', status: claimDecisionEnum.REQUEST_INFORMATION }
//       ],
//       releaseDateIsSet: false,
//       releaseDate: null
//     }

//     return submitClaimResponse(claimId, claimResponse)
//       .then(function (result) {
//         return db('Prisoner').where('Prisoner.Reference', reference)
//           .first()
//       })
//       .then(function (result) {
//         expect(result.ReleaseDateIsSet).toBe(false)
//         expect(result.ReleaseDate).toBeNull() //eslint-disable-line
//       })
//   })

//   it('should set payment method to manually processed if all claim expenses have been manually processed', function () {
//     const claimId = newIds.claimId
//     const claimResponse = {
//       caseworker,
//       decision: claimDecisionEnum.APPROVED,
//       reason: 'No valid relationship to prisoner',
//       note: 'Could not verify in NOMIS',
//       nomisCheck: claimDecisionEnum.APPROVED,
//       dwpCheck: claimDecisionEnum.APPROVED,
//       expiryDate: dateFormatter.now().add(1, 'days'),
//       claimExpenseResponses: [
//         { claimExpenseId: newIds.expenseId1, approvedCost: '10', status: claimDecisionEnum.MANUALLY_PROCESSED },
//         { claimExpenseId: newIds.expenseId2, approvedCost: '20', status: claimDecisionEnum.MANUALLY_PROCESSED }
//       ]
//     }

//     return submitClaimResponse(claimId, claimResponse)
//       .then(function (result) {
//         return db('Claim').where('ClaimId', claimId).first()
//       })
//       .then(function (claim) {
//         expect(claim.PaymentMethod).toBe(paymentMethodEnum.MANUALLY_PROCESSED.value)
//       })
//   })

//   afterAll(function () {
//     return deleteAll(reference)
//   })

//   afterEach(function () {
//     stubUpdateRelatedClaimsRemainingOverpaymentAmount = jest.fn().mockResolvedValue()
//   })
// })
