const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const config = require('../../../../knexfile').intweb
const knex = require('knex')(config)
const databaseHelper = require('../../../helpers/database-setup-for-tests')

const disableDeduction = require('../../../../app/services/data/disable-deduction')
var reference = 'V123456'
var date
var claimDeductionId

describe('services/data/disable-deduction', function () {
  describe('module', function () {
    before(function () {
      date = dateFormatter.now()
      return databaseHelper.insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimDeductionId = ids.claimDeductionId1
      })
    })

    it('should set IsEnabled to false for the specified ClaimDeduction a claim deduction when called', function () {
      var claimDeduction

      return disableDeduction(claimDeductionId)
        .then(function (claimDeductionId) {
          return knex('ClaimDeduction').first().where('ClaimDeductionId', claimDeductionId)
            .then(function (deduction) {
              claimDeduction = deduction

              expect(claimDeduction.IsEnabled).to.be.false //eslint-disable-line
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
