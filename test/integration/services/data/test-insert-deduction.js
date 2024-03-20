const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')

const insertDeduction = require('../../../../app/services/data/insert-deduction')
const deductionTypeEnum = require('../../../../app/constants/deduction-type-enum')
const ClaimDeduction = require('../../../../app/services/domain/claim-deduction')
const reference = 'V123456'
let date
let claimId

describe('services/data/insert-deduction', function () {
  describe('module', function () {
    beforeAll(function () {
      date = dateFormatter.now()
      return insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
      })
    })

    it('should add a claim deduction when called', function () {
      const claimDeductionType = deductionTypeEnum.OVERPAYMENT.value
      const claimDeductionAmount = 5
      const claimDeduction = new ClaimDeduction(claimDeductionType, claimDeductionAmount.toString())
      let updatedClaimDeduction

      return insertDeduction(claimId, claimDeduction)
        .then(function (claimDeductionId) {
          return db('ClaimDeduction').first().where('ClaimDeductionId', claimDeductionId[0].ClaimDeductionId)
        })
        .then(function (deduction) {
          updatedClaimDeduction = deduction

          return db('Claim').first().where('ClaimId', claimId)
        })
        .then(function (claim) {
          expect(updatedClaimDeduction.EligibilityId).toBe(claim.EligibilityId)
          expect(updatedClaimDeduction.Reference).toBe(claim.Reference)
          expect(updatedClaimDeduction.ClaimId).toBe(claim.ClaimId)
          expect(updatedClaimDeduction.Amount).toBe(claimDeductionAmount)
          expect(updatedClaimDeduction.DeductionType).toBe(claimDeductionType)
          expect(updatedClaimDeduction.IsEnabled).toBe(true) //eslint-disable-line
        })
        .catch(function (error) {
          throw error
        });
    })

    afterAll(function () {
      return deleteAll(reference)
    })
  })
})
