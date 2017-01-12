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
    testData = databaseHelper.getTestData(reference1, 'APPROVED')
    name = testData.Visitor.FirstName + ' ' + testData.Visitor.LastName
    ninumber = testData.Visitor.NationalInsuranceNumber
    prisonerNumber = testData.Prisoner.PrisonNumber
    prison = testData.Prisoner.NameOfPrison

    return databaseHelper.insertTestData(reference1, date.toDate(), 'APPROVED')
      .then(function (ids) {
        claimId = ids.claimId
        return databaseHelper.insertTestData(reference2, date.toDate(), 'PENDING', dateFormatter.now().toDate(), 10)
          .then(function () {
            var claimUpdate = knex('Claim')
              .update({
                'AssistedDigitalCaseworker': 'test@test.com',
                'DateOfJourney': date.toDate()
              })
              .where('Reference', reference1)
            var visitorUpdate = knex('Visitor')
              .update({
                'FirstName': 'Ref2FirstName',
                'LastName': 'Ref2LastName',
                'NationalInsuranceNumber': 'Ref2NINum'
              })
              .where('Reference', reference2)
            var prisonerUpdate = knex('Prisoner')
              .update({
                PrisonNumber: 'REF2PNO',
                NameOfPrison: 'Ref2Prison'
              })
              .where('Reference', reference2)
            var updates = []
            updates.push(claimUpdate, visitorUpdate, prisonerUpdate)
            return Promise.all(updates)
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

  it('should return the correct claim given the assisted digital field', function () {
    var searchCriteria = {
      assistedDigital: true
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
      })
  })

  it('should not return claims with the wrong assisted digital value', function () {
    var searchCriteria = {}

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithReference2 = result.claims.filter(function (claim) {
          return claim.Reference === reference2
        })
        expect(claimsWithReference2.length, `Claims with reference2 length should equal 0`).to.equal(0)
      })
  })

  it('should return the correct claim given the claim status', function () {
    var searchCriteria = {
      claimStatus: 'APPROVED'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
      })
  })

  it('should return the correct claim given all claim statuses', function () {
    var searchCriteria = {
      claimStatus: 'all'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
      })
  })

  it('should not return claims with the wrong claim status', function () {
    var searchCriteria = {
      claimStatus: 'REJECTED'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithReference2 = result.claims.filter(function (claim) {
          return claim.Reference === reference2
        })
        expect(claimsWithReference2.length, `Claims with reference2 length should equal 0`).to.equal(0)
      })
  })

  it('should return the correct claim given the mode of approval', function () {
    var searchCriteria = {
      modeOfApproval: 'APPROVED'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
      })
  })

  it('should not return claims with the wrong mode of approval', function () {
    var searchCriteria = {
      modeOfApproval: 'AUTOAPPROVED'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference.length, `Claims with current reference length should equal 0`).to.equal(0)
      })
  })

  it('should return the correct claim given whether the visit was in the past or future', function () {
    var searchCriteria = {
      pastOrFuture: 'past'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
      })
  })

  it('should not return claims with the wrong value for past or future', function () {
    var searchCriteria = {
      pastOrFuture: 'future'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference.length, `Claims with current reference length should equal 0`).to.equal(0)
      })
  })

  it('should return the correct claim given the visit rules', function () {
    var searchCriteria = {
      visitRules: 'englandScotlandWales'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
      })
  })

  it('should not return claims with the wrong value for visit rules', function () {
    var searchCriteria = {
      visitRules: 'northernIreland'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference.length, `Claims with current reference length should equal 0`).to.equal(0)
      })
  })

  it('should return the correct claim given the date of visit lower bound', function () {
    var visitDateFrom = dateFormatter.now().subtract(1, 'day').toDate()
    var searchCriteria = {
      visitDateFrom: visitDateFrom
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
      })
  })

  it('should not return claims with the wrong value for date of visit lower bound', function () {
    var visitDateFrom = dateFormatter.now().add(1, 'day').toDate()
    var searchCriteria = {
      visitDateFrom: visitDateFrom
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference.length, `Claims with current reference length should equal 0`).to.equal(0)
      })
  })

  it('should return the correct claim given the date of visit upper bound', function () {
    var visitDateTo = dateFormatter.now().add(1, 'day').toDate()
    var searchCriteria = {
      visitDateTo: visitDateTo
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
      })
  })

  it('should not return claims with the wrong value for date of visit upper bound', function () {
    var visitDateTo = dateFormatter.now().subtract(1, 'day').toDate()
    var searchCriteria = {
      visitDateTo: visitDateTo
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference.length, `Claims with current reference length should equal 0`).to.equal(0)
      })
  })

  it('should return the correct claim given the date submitted lower bound', function () {
    var dateSubmittedFrom = dateFormatter.now().subtract(1, 'day').toDate()
    var searchCriteria = {
      dateSubmittedFrom: dateSubmittedFrom
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
      })
  })

  it('should not return claims with the wrong value for date submitted lower bound', function () {
    var dateSubmittedFrom = dateFormatter.now().add(1, 'day').toDate()
    var searchCriteria = {
      dateSubmittedFrom: dateSubmittedFrom
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference.length, `Claims with current reference length should equal 0`).to.equal(0)
      })
  })

  it('should return the correct claim given the date submitted upper bound', function () {
    var dateSubmittedTo = dateFormatter.now().add(1, 'day').toDate()
    var searchCriteria = {
      dateSubmittedTo: dateSubmittedTo
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference[0].ClaimId, `ClaimId should equal ${claimId}`).to.equal(claimId)
      })
  })

  it('should not return claims with the wrong value for date submitted upper bound', function () {
    var dateSubmittedTo = dateFormatter.now().subtract(1, 'day').toDate()
    var searchCriteria = {
      dateSubmittedTo: dateSubmittedTo
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 1000)
      .then(function (result) {
        var claimsWithCurrentReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1
        })
        expect(claimsWithCurrentReference.length, `Claims with current reference length should equal 0`).to.equal(0)
      })
  })

  after(function () {
    var promises = []

    promises.push(databaseHelper.deleteAll(reference1))
    promises.push(databaseHelper.deleteAll(reference2))

    return Promise.all(promises)
  })
})
