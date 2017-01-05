var expect = require('chai').expect
var dateFormatter = require('../../../../app/services/date-formatter')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var testData
var reference = 'SEARCH1'
var date
var getClaimsListForSearch = require('../../../../app/services/data/get-claim-list-for-search')

describe('services/data/get-claim-list-for-search', function () {
  before(function () {
    date = dateFormatter.now()
    testData = databaseHelper.getTestData(reference, 'TESTING')
    return databaseHelper.insertTestData(reference, date.toDate(), 'TESTING')
  })

  it('should return inserted claim when a reference number is provided', function () {
    return getClaimsListForSearch(reference, 0, 10)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference
        })
        expect(claimsWithCurrentReference.length).to.equal(1)
      })
  })

  it('should return inserted claim when a NI number is provided', function () {
    return getClaimsListForSearch(testData.Visitor.NationalInsuranceNumber, 0, 10)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference
        })
        expect(claimsWithCurrentReference.length).to.equal(1)
      })
  })

  it('should return inserted claim when a Prison Number is provided', function () {
    return getClaimsListForSearch(testData.Prisoner.PrisonNumber, 0, 10)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference
        })
        expect(claimsWithCurrentReference.length).to.equal(1)
      })
  })

  it('should return no claims when none match search criteria', function () {
    return getClaimsListForSearch('NOMATCH1234', 0, 10)
      .then(function (result) {
        expect(result.claims.length, 'length should equal 0').to.equal(0)
        expect(result.total.Count, 'count should equal 0').to.equal(0)
      })
  })

  describe('name', function () {
    var testFirstName = 'John'
    var testLastName = 'Smith'
    var name = testFirstName + ' ' + testLastName

    it('should return correct number of claims when a full name is provided', function () {
      return getClaimsListForSearch(name, 0, 10)
        .then(function (result) {
          var claimsWithCurrentReference = result.claims.filter(function (claim) {
            return claim.Reference === reference
          })
          expect(claimsWithCurrentReference.length).to.equal(1)
        })
    })

    it('should return correct number of claims when a first name is provided', function () {
      return getClaimsListForSearch(testFirstName, 0, 10)
        .then(function (result) {
          var claimsWithCurrentReference = result.claims.filter(function (claim) {
            return claim.Reference === reference
          })
          expect(claimsWithCurrentReference.length).to.equal(1)
        })
    })

    it('should return correct number of claims when a last name is provided', function () {
      return getClaimsListForSearch(testLastName, 0, 10)
        .then(function (result) {
          var claimsWithCurrentReference = result.claims.filter(function (claim) {
            return claim.Reference === reference
          })
          expect(claimsWithCurrentReference.length).to.equal(1)
        })
    })
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
