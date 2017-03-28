const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const databaseHelper = require('../../../helpers/database-setup-for-tests')

const REFERENCE1 = 'DUPCHK1'
const REFERENCE2 = 'DUPCHK2'
const REFERENCE3 = 'DUPCHK3'

var duplicateClaimCheck = require('../../../../app/services/data/duplicate-claim-check')

var testData
var date1
var date2
var date3
var duplicateNiNumber
var duplicatePrisonerNumber
var duplicateVisitDate
var prisonerNumber
var visitDate
var claimIds = []

describe('services/data/duplicate-claim-check', function () {
  describe('module', function () {
    before(function () {
      // Insert two duplicate claims, and a third unique claim
      testData = databaseHelper.getTestData(REFERENCE1, 'Test')

      date1 = dateFormatter.now().toDate()
      date2 = dateFormatter.now().toDate()
      date2.setDate(date1.getDate() + 1000)
      date3 = new Date()
      date3.setDate(date2.getDate() + 1000)
      visitDate = new Date()
      visitDate.setDate(date3.getDate() + 1000)

      duplicateVisitDate = new Date()
      duplicateVisitDate.setDate(visitDate.getDate() + 1000)
      duplicateNiNumber = testData.Visitor.NationalInsuranceNumber
      duplicatePrisonerNumber = testData.Prisoner.PrisonNumber

      prisonerNumber = duplicatePrisonerNumber + 'A'

      return databaseHelper.insertTestData(REFERENCE1, date1, 'Test', visitDate)
        .then(function (ids) {
          claimIds.push(ids.claimId)
          return databaseHelper.insertTestData(REFERENCE2, date2, 'Test', duplicateVisitDate, 10000)
            .then(function () {
              claimIds.push(ids.claimId)
              return databaseHelper.insertTestData(REFERENCE3, date3, 'Test', duplicateVisitDate, 20000)
                .then(function (ids) {
                  claimIds.push(ids.claimId)
                })
            })
        })
    })

    it('returns true if another claim exists with the same NI number, prisoner number and date of visit', function () {
      return duplicateClaimCheck(claimIds[1], duplicateNiNumber, duplicatePrisonerNumber, duplicateVisitDate)
        .then(function (result) {
          expect(result).to.have.length.above(0)
        })
    })

    it('returns false if no other claim exists with the same NI number, prisoner number and date of visit', function () {
      return duplicateClaimCheck(claimIds[0], duplicateNiNumber, prisonerNumber, duplicateVisitDate)
        .then(function (result) {
          expect(result).to.have.length.below(1)
        })
    })

    after(function () {
      return Promise.all([
        databaseHelper.deleteAll(REFERENCE1),
        databaseHelper.deleteAll(REFERENCE2),
        databaseHelper.deleteAll(REFERENCE3)
      ])
    })
  })
})
