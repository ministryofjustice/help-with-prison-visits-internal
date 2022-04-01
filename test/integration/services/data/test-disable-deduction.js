const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')

const disableDeduction = require('../../../../app/services/data/disable-deduction')
var reference = 'V123456'
var date
var claimDeductionId

describe('services/data/disable-deduction', function () {
  describe('module', function () {
    before(function () {
      date = dateFormatter.now()
      return insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimDeductionId = ids.claimDeductionId1
      })
    })

    it('should set IsEnabled to false for the specified ClaimDeduction a claim deduction when called', function () {
      return disableDeduction(claimDeductionId)
        .then(function (claimDeductionId) {
          return db('ClaimDeduction').first().where('ClaimDeductionId', claimDeductionId[0].ClaimDeductionId)
        })
        .then(function (deduction) {
          expect(deduction.IsEnabled).to.be.false //eslint-disable-line
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function () {
      return deleteAll(reference)
    })
  })
})
