const config = require('../../../../knexfile').intweb
const knex = require('knex')(config)

const getClaimListForAdvancedSearch = require('../../../../app/services/data/get-claim-list-for-advanced-search')
var dateFormatter = require('../../../../app/services/date-formatter')
var databaseHelper = require('../../../helpers/database-setup-for-tests')
var expect = require('chai').expect

var date
var reference1 = 'SQBUIL1'
var reference2 = 'SQBUIL2'
var claimId
var testData
var name
var ninumber
var prisonerNumber
var prison

describe('services/data/get-claim-list-for-advanced-search', function () {
  before(function () {
    date = dateFormatter.now()
    testData = databaseHelper.getTestData(reference1, 'TESTING')
    name = testData.Visitor.FirstName + ' ' + testData.Visitor.LastName
    ninumber = testData.Visitor.NationalInsuranceNumber
    prisonerNumber = testData.Prisoner.PrisonNumber
    prison = testData.Prisoner.NameOfPrison

    return databaseHelper.insertTestData(reference1, date.toDate(), 'TESTING')
      .then(function (ids) {
        claimId = ids.claimId
        return databaseHelper.insertTestData(reference2, date.toDate(), 'TESTING', dateFormatter.now().toDate(), 10)
          .then(function () {
            return knex('Visitor')
              .update({
                'FirstName': 'Ref2FirstName',
                'LastName': 'Ref2LastName',
                'NationalInsuranceNumber': 'Ref2NINum'
              })
              .where('Reference', reference2)
              .then(function () {
                return knex('Prisoner')
                  .update({
                    PrisonNumber: 'REF2PNO',
                    NameOfPrison: 'Ref2Prison'
                  })
                  .where('Reference', reference2)
              })
          })
      })
  })

  it('should return 0 claims given empty search criteria', function () {
    var searchCriteria = {}

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        expect(result.claims.length, 'Claims length should equal 0').to.equal(0)
        expect(result.total, 'Total should equal 0').to.equal(0)
      })
  })

  it('should return the correct claim given the reference number', function () {
    var searchCriteria = {
      reference: reference1
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        expect(result.claims[0].Reference, `Reference should equal ${reference1}`).to.equal(reference1)
        expect(result.claims[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
        expect(result.claims.length, 'Claims length should equal 1').to.equal(1)
      })
  })

  it('should not return claims with the wrong reference number', function () {
    var searchCriteria = {
      reference: reference1
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference2 = result.claims.filter(function (claim) {
          return claim.Reference === reference2
        })
        expect(claimsWithCurrentReference2.length, `Claims length should equal 1`).to.equal(0)
      })
  })

  it('should return the correct claim given the name', function () {
    var searchCriteria = {
      name: name
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
        expect(claimsWithCurrentReference[0].Name, `Name should equal ${name}`).to.equal(name)
      })
  })

  it('should return the correct claim given the first name only', function () {
    var searchCriteria = {
      name: testData.Visitor.FirstName
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
      })
  })

  it('should not return claims with the wrong name', function () {
    var searchCriteria = {
      name: name
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithReference2 = result.claims.filter(function (claim) {
          return claim.Reference === reference2
        })
        expect(claimsWithReference2.length, `Claims with reference2 length should equal 0`).to.equal(0)
      })
  })

  it('should return the correct claim given the national insurance number', function () {
    var searchCriteria = {
      ninumber: ninumber
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
      })
  })

  it('should not return claims with the wrong national insurance number', function () {
    var searchCriteria = {
      ninumber: ninumber
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithReference2 = result.claims.filter(function (claim) {
          return claim.Reference === reference2
        })
        expect(claimsWithReference2.length, `Claims with reference2 length should equal 0`).to.equal(0)
      })
  })

  it('should return the correct claim given the prisoner number', function () {
    var searchCriteria = {
      prisonerNumber: prisonerNumber
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
      })
  })

  it('should not return claims with the wrong prisoner number', function () {
    var searchCriteria = {
      prisonerNumber: prisonerNumber
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithReference2 = result.claims.filter(function (claim) {
          return claim.Reference === reference2
        })
        expect(claimsWithReference2.length, `Claims with reference2 length should equal 0`).to.equal(0)
      })
  })

  it('should return the correct claim given the prison', function () {
    var searchCriteria = {
      prison: prison
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
      })
  })

  it('should not return claims with the wrong prison', function () {
    var searchCriteria = {
      prison: prison
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithReference2 = result.claims.filter(function (claim) {
          return claim.Reference === reference2
        })
        expect(claimsWithReference2.length, `Claims with reference2 length should equal 0`).to.equal(0)
      })
  })

  it('should return the correct fields when returning export data', function () {
    var searchCriteria = {
      prison: prison
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000, true)
      .then(function (result) {
        var claim = result.claims[0]

        expect(claim.hasOwnProperty('FirstName')).to.be.true
        expect(claim.hasOwnProperty('LastName')).to.be.true
        expect(claim.hasOwnProperty('Benefit')).to.be.true
        expect(claim.hasOwnProperty('Relationship')).to.be.true
        expect(claim.hasOwnProperty('DateSubmitted')).to.be.true
        expect(claim.hasOwnProperty('DateOfJourney')).to.be.true
        expect(claim.hasOwnProperty('DateReviewed')).to.be.true
        expect(claim.hasOwnProperty('ClaimType')).to.be.true
        expect(claim.hasOwnProperty('AssistedDigitalCaseworker')).to.be.true
        expect(claim.hasOwnProperty('Caseworker')).to.be.true
        expect(claim.hasOwnProperty('IsAdvanceClaim')).to.be.true
        expect(claim.hasOwnProperty('Status')).to.be.true
        expect(claim.hasOwnProperty('BankPaymentAmount')).to.be.true
        expect(claim.hasOwnProperty('ClaimId')).to.be.true
        expect(claim.hasOwnProperty('IsTrusted')).to.be.true
        expect(claim.hasOwnProperty('NameOfPrison')).to.be.true
      })
  })

  it('should return the correct fields when returning advanced search data', function () {
    var searchCriteria = {
      prison: prison
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000, false)
      .then(function (result) {
        var claim = result.claims[0]

        expect(claim.hasOwnProperty('Reference')).to.be.true
        expect(claim.hasOwnProperty('FirstName')).to.be.true
        expect(claim.hasOwnProperty('LastName')).to.be.true
        expect(claim.hasOwnProperty('DateSubmitted')).to.be.true
        expect(claim.hasOwnProperty('DateOfJourney')).to.be.true
        expect(claim.hasOwnProperty('ClaimType')).to.be.true
        expect(claim.hasOwnProperty('ClaimId')).to.be.true
      })
  })

  after(function () {
    var promises = []

    promises.push(databaseHelper.deleteAll(reference1))
    promises.push(databaseHelper.deleteAll(reference2))

    return Promise.all(promises)
  })
})
