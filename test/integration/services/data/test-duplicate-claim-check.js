var expect = require('chai').expect
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var duplicateClaimCheck = require('../../../../app/services/data/duplicate-claim-check')
var reference1 = 'V123456'
var reference2 = 'V234567'
var reference3 = 'V345678'
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
      testData = databaseHelper.getTestData(reference1, 'Test')

      date1 = new Date()
      date2 = new Date()
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

      return databaseHelper.insertDuplicateClaims(reference1, date1, 'Test', visitDate)
        .then(function (ids) {
          claimIds.push(ids.claimId)
          return databaseHelper.insertDuplicateClaims(reference2, date2, 'Test', duplicateVisitDate)
            .then(function () {
              claimIds.push(ids.claimId)
              return databaseHelper.insertDuplicateClaims(reference3, date3, 'Test', duplicateVisitDate)
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
        databaseHelper.deleteAll(reference1)
        // databaseHelper.deleteAll(reference2),
        // databaseHelper.deleteAll(reference3)
      ])
    })
  })
})
