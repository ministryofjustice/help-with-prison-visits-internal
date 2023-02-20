const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const { getTestData, insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')
const { getClaimReference, getClaimId } = require('../../../helpers/integration')

let testData
const reference1 = 'SEARCH1'
const reference2 = 'SEARCH2'
const reference3 = 'ASDFGH1'

let claimId1
let claimId2

const testFirstName = 'John'
const testLastName = 'Smith'
const name = testFirstName + ' ' + testLastName

let date
const getClaimsListForSearch = require('../../../../app/services/data/get-claim-list-for-search')

describe('services/data/get-claim-list-for-search', function () {
  before(function () {
    date = dateFormatter.build('10', '09', '2016')
    testData = getTestData(reference1, 'TESTING')

    const promises = []
    promises.push(insertTestData(reference1, date.toDate(), 'TESTING')
      .then(function (ids) {
        claimId1 = ids.claimId
      })
    )
    promises.push(insertTestData(reference2, date.toDate(), 'TESTING', date.toDate(), 10)
      .then(function (ids) {
        claimId2 = ids.claimId
      })
    )
    promises.push(
      insertTestData(reference3, date.toDate(), 'TESTING', date.toDate(), 20)
        .then(function (ids) {
          return db('Visitor')
            .update({
              NationalInsuranceNumber: '00000',
              FirstName: 'Ref3FirstName',
              LastName: 'Ref3LastName'
            })
            .where('Reference', reference3)
            .then(function () {
              return db('Prisoner')
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
        const claimsWithMatchingReference = result.claims.filter(function (claim) {
          return claim.Reference === reference1 || claim.Reference === reference2
        })
        expect(claimsWithMatchingReference.length).to.equal(2)
        const claimsWithCurrentId = result.claims.filter(function (claim) {
          return claim.ClaimId === claimId1 || claim.ClaimId === claimId2
        })
        expect(claimsWithCurrentId.length).to.equal(2)
      })
  })

  it('should not return claims with a reference number that does not match', function () {
    return getClaimsListForSearch('SEARCH', 0, 10)
      .then(function (result) {
        const claimsWithReference3 = getClaimReference(result, reference3)
        expect(claimsWithReference3.length).to.equal(0)
      })
  })

  it('should return inserted claim when a full NI number is provided', function () {
    return getClaimsListForSearch(testData.Visitor.NationalInsuranceNumber, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        expect(claimsWithCurrentReference.length).to.equal(1)
        const claimsWithCurrentId = getClaimId(result, claimId1)
        expect(claimsWithCurrentId.length).to.equal(1)
      })
  })

  it('should return inserted claim when a partial NI number is provided', function () {
    return getClaimsListForSearch(testData.Visitor.NationalInsuranceNumber.substring(3), 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        expect(claimsWithCurrentReference.length).to.equal(1)
        const claimsWithCurrentId = getClaimId(result, claimId1)
        expect(claimsWithCurrentId.length).to.equal(1)
      })
  })

  it('should not return claims with a NI number that does not match', function () {
    return getClaimsListForSearch(testData.Visitor.NationalInsuranceNumber, 0, 10)
      .then(function (result) {
        const claimsWithReference3 = getClaimReference(result, reference3)
        expect(claimsWithReference3.length).to.equal(0)
      })
  })

  it('should return inserted claim when a full Prison Number is provided', function () {
    return getClaimsListForSearch(testData.Prisoner.PrisonNumber, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        expect(claimsWithCurrentReference.length).to.equal(1)
        const claimsWithCurrentId = getClaimId(result, claimId1)
        expect(claimsWithCurrentId.length).to.equal(1)
      })
  })

  it('should return inserted claim when a partial Prison Number is provided', function () {
    return getClaimsListForSearch(testData.Prisoner.PrisonNumber.substring(3), 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        expect(claimsWithCurrentReference.length).to.equal(1)
      })
  })

  it('should not return claims with a Prison number that does not match', function () {
    return getClaimsListForSearch(testData.Visitor.PrisonNumber, 0, 10)
      .then(function (result) {
        const claimsWithReference3 = getClaimReference(result, reference3)
        expect(claimsWithReference3.length).to.equal(0)
      })
  })

  it('should return inserted claim when a full name is provided', function () {
    return getClaimsListForSearch(name, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        expect(claimsWithCurrentReference.length).to.equal(1)
      })
  })

  it('should return inserted claim when a first name is provided', function () {
    return getClaimsListForSearch(testFirstName, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        expect(claimsWithCurrentReference.length).to.equal(1)
      })
  })

  it('should return inserted claim when a last name is provided', function () {
    return getClaimsListForSearch(testLastName, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        expect(claimsWithCurrentReference.length).to.equal(1)
      })
  })

  it('should not return claims with a name that does not match', function () {
    return getClaimsListForSearch(testFirstName, 0, 10)
      .then(function (result) {
        const claimsWithReference3 = getClaimReference(result, reference3)
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
    const promises = []
    promises.push(deleteAll(reference1))
    promises.push(deleteAll(reference2))
    promises.push(deleteAll(reference3))

    return Promise.all(promises)
  })
})
