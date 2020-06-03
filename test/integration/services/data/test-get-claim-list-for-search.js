const config = require('../../../../knexfile').intweb
const knex = require('knex')(config)

var expect = require('chai').expect
var dateFormatter = require('../../../../app/services/date-formatter')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var testData
var reference1 = 'SEARCH1'
var reference2 = 'SEARCH2'
var reference3 = 'ASDFGH1'

var claimId1
var claimId2

var testFirstName = 'John'
var testLastName = 'Smith'
var name = testFirstName + ' ' + testLastName

var date
var getClaimsListForSearch = require('../../../../app/services/data/get-claim-list-for-search')

describe('services/data/get-claim-list-for-search', function () {
  before(function () {
    date = dateFormatter.build('10', '09', '2016')
    testData = databaseHelper.getTestData(reference1, 'TESTING')

    var promises = []
    promises.push(databaseHelper.insertTestData(reference1, date.toDate(), 'TESTING')
      .then(function (ids) {
        claimId1 = ids.claimId
      })
    )
    promises.push(databaseHelper.insertTestData(reference2, date.toDate(), 'TESTING', date.toDate(), 10)
      .then(function (ids) {
        claimId2 = ids.claimId
      })
    )
    promises.push(
      databaseHelper.insertTestData(reference3, date.toDate(), 'TESTING', date.toDate(), 20)
        .then(function (ids) {
          return knex('Visitor')
            .update({
              NationalInsuranceNumber: '00000',
              FirstName: 'Ref3FirstName',
              LastName: 'Ref3LastName'
            })
            .where('Reference', reference3)
            .then(function () {
              return knex('Prisoner')
                .update({
                  PrisonNumber: '00000'
                })
                .where('Reference', reference3)
            })
        })
    )

    return Promise.all(promises)
  })

  it('should return inserted claim when a full reference number is provided', function () {
    return getClaimsListForSearch(reference1, 0, 10)
      .then(function (result) {
        expect(result.claims[0].ClaimId).to.equal(claimId1)
        expect(result.claims.length).to.equal(1)
      })
  })

  it('should return inserted claims when a partial reference number is provided', function () {
    return getClaimsListForSearch('SEARCH', 0, 10)
      .then(function (result) {
        var claimsWithMatchingReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1 || claim.Reference === reference2
        })
        expect(claimsWithMatchingReference.length).to.equal(2)
        var claimsWithCurrentId = result.claims.filter(function (claim) {
          return claim.ClaimId === claimId1 || claim.ClaimId === claimId2
        })
        expect(claimsWithCurrentId.length).to.equal(2)
      })
  })

  it('should not return claims with a reference number that does not match', function () {
    return getClaimsListForSearch('SEARCH', 0, 10)
      .then(function (result) {
        var claimsWithReference3 = result.claims.filter(function (claim) {
          return claim.Reference === reference3
        })
        expect(claimsWithReference3.length).to.equal(0)
      })
  })

  it('should return inserted claim when a full NI number is provided', function () {
    return getClaimsListForSearch(testData.Visitor.NationalInsuranceNumber, 0, 10)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference.length).to.equal(1)
        var claimsWithCurrentId = result.claims.filter(function (claim) {
          return claim.ClaimId === claimId1
        })
        expect(claimsWithCurrentId.length).to.equal(1)
      })
  })

  it('should return inserted claim when a partial NI number is provided', function () {
    return getClaimsListForSearch(testData.Visitor.NationalInsuranceNumber.substring(3), 0, 10)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference.length).to.equal(1)
        var claimsWithCurrentId = result.claims.filter(function (claim) {
          return claim.ClaimId === claimId1
        })
        expect(claimsWithCurrentId.length).to.equal(1)
      })
  })

  it('should not return claims with a NI number that does not match', function () {
    return getClaimsListForSearch(testData.Visitor.NationalInsuranceNumber, 0, 10)
      .then(function (result) {
        var claimsWithReference3 = result.claims.filter(function (claim) {
          return claim.Reference === reference3
        })
        expect(claimsWithReference3.length).to.equal(0)
      })
  })

  it('should return inserted claim when a full Prison Number is provided', function () {
    return getClaimsListForSearch(testData.Prisoner.PrisonNumber, 0, 10)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference.length).to.equal(1)
        var claimsWithCurrentId = result.claims.filter(function (claim) {
          return claim.ClaimId === claimId1
        })
        expect(claimsWithCurrentId.length).to.equal(1)
      })
  })

  it('should return inserted claim when a partial Prison Number is provided', function () {
    return getClaimsListForSearch(testData.Prisoner.PrisonNumber.substring(3), 0, 10)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference.length).to.equal(1)
      })
  })

  it('should not return claims with a Prison number that does not match', function () {
    return getClaimsListForSearch(testData.Visitor.PrisonNumber, 0, 10)
      .then(function (result) {
        var claimsWithReference3 = result.claims.filter(function (claim) {
          return claim.Reference === reference3
        })
        expect(claimsWithReference3.length).to.equal(0)
      })
  })

  it('should return inserted claim when a full name is provided', function () {
    return getClaimsListForSearch(name, 0, 10)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference.length).to.equal(1)
      })
  })

  it('should return inserted claim when a first name is provided', function () {
    return getClaimsListForSearch(testFirstName, 0, 10)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference.length).to.equal(1)
      })
  })

  it('should return inserted claim when a last name is provided', function () {
    return getClaimsListForSearch(testLastName, 0, 10)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference.length).to.equal(1)
      })
  })

  it('should not return claims with a name that does not match', function () {
    return getClaimsListForSearch(testFirstName, 0, 10)
      .then(function (result) {
        var claimsWithReference3 = result.claims.filter(function (claim) {
          return claim.Reference === reference3
        })
        expect(claimsWithReference3.length).to.equal(0)
      })
  })

  it('should return no claims when none match search criteria', function () {
    return getClaimsListForSearch('NOMATCH1234', 0, 10)
      .then(function (result) {
        expect(result.claims.length, 'length should equal 0').to.equal(0)
        expect(result.total.Count, 'count should equal 0').to.equal(0)
      })
  })

  after(function () {
    var promises = []
    promises.push(databaseHelper.deleteAll(reference1))
    promises.push(databaseHelper.deleteAll(reference2))
    promises.push(databaseHelper.deleteAll(reference3))

    return Promise.all(promises)
  })
})
