var expect = require('chai').expect
var dateFormatter = require('../../../../app/services/date-formatter')
var databaseHelper = require('../../../helpers/database-setup-for-tests')
var config = require('../../../../knexfile').migrations
var knex = require('knex')(config)

var testData
var reference = 'SEARCH1'
var date
var claimId
var getClaimsListForSearch = require('../../../../app/services/data/get-claim-list-for-search')

describe('services/data/get-claim-list-for-search', function () {
  before(function () {
    date = dateFormatter.now()
    testData = databaseHelper.getTestData(reference, 'TESTING')
    return databaseHelper.insertTestData(reference, date.toDate(), 'TESTING')
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should return correct number of claims when a reference number is provided', function () {
    return getClaimsListForSearch(reference, 0, 10)
      .then(function (result) {
        expect(result.claims.length, 'length should equal 1').to.equal(1)
        expect(result.claims[0].Reference).to.equal(reference)
        expect(result.claims[0].ClaimId).to.equal(claimId)
        expect(result.total.Count, 'count should equal 1').to.equal(1)
      })
  })

  it('should return correct number of claims when a NI number is provided', function () {
    return getClaimsListForSearch(testData.Visitor.NationalInsuranceNumber, 0, 10)
      .then(function (result) {
        expect(result.claims.length, 'length should equal 1').to.equal(1)
        expect(result.claims[0].Reference).to.equal(reference)
        expect(result.claims[0].ClaimId).to.equal(claimId)
        expect(result.total.Count, 'count should equal 1').to.equal(1)
      })
  })

  it('should return correct number of claims when a Prison Number is provided', function () {
    return getClaimsListForSearch(testData.Prisoner.PrisonNumber, 0, 10)
      .then(function (result) {
        expect(result.claims.length, 'length should equal 1').to.equal(1)
        expect(result.claims[0].Reference).to.equal(reference)
        expect(result.claims[0].ClaimId).to.equal(claimId)
        expect(result.total.Count, 'count should equal 1').to.equal(1)
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
    var testFirstName = 'Search'
    var testLastName = 'Test'
    var name = testFirstName + ' ' + testLastName

    before(function () {
      // Change name so other test rows are not returned
      return knex('IntSchema.Visitor')
        .update({'FirstName': testFirstName, 'LastName': testLastName})
        .where('Reference', reference)
    })

    it('should return correct number of claims when a full name is provided', function () {
      return getClaimsListForSearch(name, 0, 10)
        .then(function (result) {
          expect(result.claims.length, 'length should equal 1').to.equal(1)
          expect(result.claims[0].Reference).to.equal(reference)
          expect(result.claims[0].ClaimId).to.equal(claimId)
          expect(result.total.Count, 'count should equal 1').to.equal(1)
        })
    })

    it('should return correct number of claims when a first name is provided', function () {
      return getClaimsListForSearch(testFirstName, 0, 10)
        .then(function (result) {
          expect(result.claims.length, 'length should equal 1').to.equal(1)
          expect(result.claims[0].Reference).to.equal(reference)
          expect(result.claims[0].ClaimId).to.equal(claimId)
          expect(result.total.Count, 'count should equal 1').to.equal(1)
        })
    })

    it('should return correct number of claims when a last name is provided', function () {
      return getClaimsListForSearch(testLastName, 0, 10)
        .then(function (result) {
          expect(result.claims.length, 'length should equal 1').to.equal(1)
          expect(result.claims[0].Reference).to.equal(reference)
          expect(result.claims[0].ClaimId).to.equal(claimId)
          expect(result.total.Count, 'count should equal 1').to.equal(1)
        })
    })

    after(function () {
      return knex('IntSchema.Visitor')
        .update({'FirstName': 'John', 'LastName': 'Smith'})
        .where('Reference', reference)
    })
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
