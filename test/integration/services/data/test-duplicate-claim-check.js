const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll } = require('../../../helpers/database-setup-for-tests')
const duplicateClaimCheck = require('../../../../app/services/data/duplicate-claim-check')

const REFERENCE1 = 'DUPCHK1'
const REFERENCE2 = 'DUPCHK2'
const prisonerNumber = 'A123456'
const niNumber = 'QQ123456C'
const visitDate = dateFormatter.buildFromDateString('2022-03-03').toDate()
const claimIds = []

describe('services/data/duplicate-claim-check', function () {
  describe('module', function () {
    beforeAll(function () {
      const dateOfBirth = dateFormatter.buildFromDateString('1999-01-01').toDate()

      return insertTestData(REFERENCE1, dateOfBirth, 'Test', visitDate)
        .then(function (ids) {
          claimIds.push(ids.claimId)
          return insertTestData(REFERENCE2, dateOfBirth, 'Test', visitDate, 10000)
        })
        .then(function (ids) {
          claimIds.push(ids.claimId)
        })
    })

    it('returns true if another claim exists with the same NI number, prisoner number and date of visit', function () {
      return duplicateClaimCheck(claimIds[1], niNumber, prisonerNumber, visitDate)
        .then(function (result) {
          expect(result.length).toBeGreaterThan(0)
        })
    })

    it('returns false if no other claim exists with the same NI number, prisoner number and date of visit', function () {
      return duplicateClaimCheck(claimIds[0], niNumber, `${prisonerNumber}A`, visitDate)
        .then(function (result) {
          expect(result.length).toBeLessThan(1)
        })
    })

    afterAll(function () {
      return Promise.all([
        deleteAll(REFERENCE1),
        deleteAll(REFERENCE2)
      ])
    })
  })
})
