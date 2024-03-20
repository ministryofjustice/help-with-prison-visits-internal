// const dateFormatter = require('../../../../app/services/date-formatter')
// const { getTestData, insertTestData, deleteAll } = require('../../../helpers/database-setup-for-tests')

// const stubOverpaidClaimsData = {}
// const stubGetOverpaidClaims = jest.fn().mockResolvedValue(stubOverpaidClaimsData)
// const getClaim = proxyquire('../../../../app/services/data/get-individual-claim-details', {
//   './get-overpaid-claims-by-reference': stubGetOverpaidClaims
// })
// const reference = 'INDIVCD'
// let testData
// let date
// let claimId

// describe('services/data/get-individual-claim-details', function () {
//   describe('get', function () {
//     beforeAll(function () {
//       testData = getTestData(reference, 'Test')
//       date = dateFormatter.now().toDate()
//       return insertTestData(reference, date, 'Test').then(function (ids) {
//         claimId = ids.claimId
//       })
//     })

//     it('should return a claims details', function () {
//       return getClaim(claimId)
//         .then(function (result) {
//           expect(result.claim.Reference).toBe(reference)
//           expect(result.claim.ClaimType).toBe('first-time')
//           expect(result.claim.IsAdvanceClaim).toBe(false)
//           expect(result.claim.IsOverpaid).toBe(false)
//           expect(result.claim.OverpaymentAmount).toBe(20)
//           expect(result.claim.FirstName).toBe(testData.Visitor.FirstName)
//           expect(result.claim.DateSubmitted.toString()).toBe(date.toString())
//           expect(result.claim.NationalInsuranceNumber).toBe(testData.Visitor.NationalInsuranceNumber)
//           expect(result.claim.HouseNumberAndStreet).toBe(testData.Visitor.HouseNumberAndStreet)
//           expect(result.claim.EmailAddress).toBe(testData.Visitor.EmailAddress)
//           expect(result.claim.PrisonNumber).toBe(testData.Prisoner.PrisonNumber)
//           expect(result.claim.NameOfPrison).toBe(testData.Prisoner.NameOfPrison)
//           expect(result.claimExpenses[0].ExpenseType).toBe(testData.ClaimExpenses[0].ExpenseType)
//           expect(result.claimExpenses[0].DocumentStatus).toBe(testData.ClaimDocument.expense.DocumentStatus)
//           expect(result.claimExpenses[1].Cost).toBe(testData.ClaimExpenses[1].Cost)
//           expect(result.claim.visitConfirmation.DocumentStatus).toBe(testData.ClaimDocument['visit-confirmation'].DocumentStatus)
//           expect(result.claim.benefitDocument[0].DocumentStatus).toBe(testData.ClaimDocument.benefit.DocumentStatus)
//           expect(result.claimChild[0].FirstName).toBe(testData.ClaimChild[0].FirstName)
//           expect(result.claimChild[0].LastName).toBe(testData.ClaimChild[0].LastName)
//           expect(result.claimChild[1].FirstName).toBe(testData.ClaimChild[1].FirstName)
//           expect(result.claimChild[1].LastName).toBe(testData.ClaimChild[1].LastName)
//           expect(result.claimEvents[0].Caseworker).toBe(testData.ClaimEvent[0].Caseworker)
//           expect(result.claimEvents[1].Caseworker).toBe(testData.ClaimEvent[1].Caseworker)
//           expect(result.deductions[0].DeductionType).toBe(testData.ClaimDeduction.hc3.DeductionType)
//           expect(result.deductions[1].DeductionType).toBe(testData.ClaimDeduction.overpayment.DeductionType)

//           expect(stubGetOverpaidClaims.calledWith(reference)).toBe(true) //eslint-disable-line
//         })
//         .catch(function (error) {
//           throw error
//         })
//     })

//     afterAll(function () {
//       return deleteAll(reference)
//     })
//   })
// })
