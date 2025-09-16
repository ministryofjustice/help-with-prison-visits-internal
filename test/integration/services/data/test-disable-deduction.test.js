const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')

const disableDeduction = require('../../../../app/services/data/disable-deduction')
const reference = 'V123456'
let date
let claimDeductionId

describe('services/data/disable-deduction', () => {
  describe('module', () => {
    beforeAll(() => {
      date = dateFormatter.now()
      return insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimDeductionId = ids.claimDeductionId1
      })
    })

    it('should set IsEnabled to false for the specified ClaimDeduction a claim deduction when called', () => {
      return disableDeduction(claimDeductionId)
        .then(function (claimDeductionId) {
          return db('ClaimDeduction').first().where('ClaimDeductionId', claimDeductionId[0].ClaimDeductionId)
        })
        .then(deduction => {
          expect(deduction.IsEnabled).toBe(false)
        })
        .catch(error => {
          throw error
        })
    })

    afterAll(() => {
      return deleteAll(reference)
    })
  })
})
