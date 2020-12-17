const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const config = require('../../../../knexfile').intweb
const knex = require('knex')(config)
const databaseHelper = require('../../../helpers/database-setup-for-tests')

const insertDeduction = require('../../../../app/services/data/insert-deduction')
const deductionTypeEnum = require('../../../../app/constants/deduction-type-enum')
const ClaimDeduction = require('../../../../app/services/domain/claim-deduction')
var reference = 'V123456'
var date
var claimId

describe('services/data/insert-deduction', function () {
  describe('module', function () {
    before(function () {
      date = dateFormatter.now()
      return databaseHelper.insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
      })
    })

    it('should add a claim deduction when called', function () {
      var claimDeductionType = deductionTypeEnum.OVERPAYMENT.value
      var claimDeductionAmount = 5
      var claimDeduction = new ClaimDeduction(claimDeductionType, claimDeductionAmount.toString())

      return insertDeduction(claimId, claimDeduction)
        .then(function (claimDeductionId) {
          return knex('ClaimDeduction').first().where('ClaimDeductionId', claimDeductionId)
            .then(function (deduction) {
              var updatedClaimDeduction = deduction

              return knex('Claim').first().where('ClaimId', claimId)
                .then(function (claim) {
                  expect(updatedClaimDeduction.EligibilityId).to.equal(claim.EligibilityId)
                  expect(updatedClaimDeduction.Reference).to.equal(claim.Reference)
                  expect(updatedClaimDeduction.ClaimId).to.equal(claim.ClaimId)
                  expect(updatedClaimDeduction.Amount).to.equal(claimDeductionAmount)
                  expect(updatedClaimDeduction.DeductionType).to.equal(claimDeductionType)
                  expect(updatedClaimDeduction.IsEnabled).to.be.true //eslint-disable-line
                })
            })
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function () {
      return databaseHelper.deleteAll(reference)
    })
  })
})
