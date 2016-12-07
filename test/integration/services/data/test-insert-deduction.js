const expect = require('chai').expect
const moment = require('moment')
const config = require('../../../../knexfile').intweb
const knex = require('knex')(config)
const databaseHelper = require('../../../helpers/database-setup-for-tests')

const insertDeduction = require('../../../../app/services/data/insert-deduction')
const deductionTypeEnum = require('../../../../app/constants/deduction-type-enum')
var reference = 'V123456'
var date
var claimId

describe('services/data/insert-deduction', function () {
  describe('module', function () {
    before(function () {
      date = moment()
      return databaseHelper.insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
      })
    })

    it('should add a claim deduction when called', function () {
      var claimDeduction
      var claimDeductionType = deductionTypeEnum.OVERPAYMENT.value
      var claimDeductionAmount = 5

      return insertDeduction(claimId, claimDeductionType, claimDeductionAmount)
        .then(function (claimDeductionId) {
          return knex('ClaimDeduction').first().where('ClaimDeductionId', claimDeductionId)
            .then(function (deduction) {
              claimDeduction = deduction

              return knex('Claim').first().where('ClaimId', claimId)
                .then(function (claim) {
                  expect(claimDeduction.EligibilityId).to.equal(claim.EligibilityId)
                  expect(claimDeduction.Reference).to.equal(claim.Reference)
                  expect(claimDeduction.ClaimId).to.equal(claim.ClaimId)
                  expect(claimDeduction.Amount).to.equal(claimDeductionAmount)
                  expect(claimDeduction.DeductionType).to.equal(claimDeductionType)
                  expect(claimDeduction.IsEnabled).to.be.true
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
