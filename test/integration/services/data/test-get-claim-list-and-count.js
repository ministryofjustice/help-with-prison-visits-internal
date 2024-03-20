const dateFormatter = require('../../../../app/services/date-formatter')
const { getTestData, insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')

const getClaimListAndCount = require('../../../../app/services/data/get-claim-list-and-count')
let testData
const reference = 'CLISTC1'
let date
let claimId

describe('services/data/get-claim-list-and-count', function () {
  describe('module', function () {
    beforeEach(function () {
      date = dateFormatter.now()
      testData = getTestData(reference, 'TESTING')
      return insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
      })
    })

    it('should return list of claims and total', function () {
      return getClaimListAndCount(['TESTING'], false, 0, 1, 'TestUser@test.com', 'Claim.DateSubmitted', 'asc')
        .then(function (result) {
          expect(result.claims.length).toBe(1)
          expect(result.claims[0].Reference).toBe(reference)
          expect(result.claims[0].FirstName).toBe(testData.Visitor.FirstName)
          expect(result.claims[0].LastName).toBe(testData.Visitor.LastName)
          expect(result.claims[0].Name).toBe(`${testData.Visitor.FirstName} ${testData.Visitor.LastName}`)
          expect(result.claims[0].DateSubmittedFormatted.toString()).toBe(date.format('DD/MM/YYYY - HH:mm').toString())
          expect(result.claims[0].ClaimType).toBe(testData.Claim.ClaimType)
          expect(result.claims[0].AssignedTo).toBe(testData.Claim.AssignedTo)
          expect(result.claims[0].ClaimId).toBe(claimId)
          expect(result.total.Count).toBe(1)
        })
        .catch(function (error) {
          throw error
        });
    })

    it('should return list of claims and total when AssignedTo is null', function () {
      return db('Claim').where({ ClaimId: claimId }).update({ AssignedTo: null })
        .then(function () {
          return getClaimListAndCount(['TESTING'], false, 0, 1, 'TestUser@test.com', 'Claim.DateSubmitted', 'asc')
        })
        .then(function (result) {
          expect(result.claims.length).toBe(1)
          expect(result.claims[0].Reference).toBe(reference)
          expect(result.claims[0].FirstName).toBe(testData.Visitor.FirstName)
          expect(result.claims[0].LastName).toBe(testData.Visitor.LastName)
          expect(result.claims[0].Name).toBe(`${testData.Visitor.FirstName} ${testData.Visitor.LastName}`)
          expect(result.claims[0].DateSubmittedFormatted.toString()).toBe(date.format('DD/MM/YYYY - HH:mm').toString())
          expect(result.claims[0].ClaimType).toBe(testData.Claim.ClaimType)
          expect(result.claims[0].AssignedTo).toBeNull()
          expect(result.claims[0].ClaimId).toBe(claimId)
          expect(result.total.Count).toBe(1)
        })
        .catch(function (error) {
          throw error
        });
    })

    it('should return list of claims and total when AssignedTo is another user, but it is after AssignmentExpiry', function () {
      return db('Claim').where({ ClaimId: claimId }).update({ AssignmentExpiry: dateFormatter.now().subtract('10', 'minutes').toDate() })
        .then(function () {
          return getClaimListAndCount(['TESTING'], false, 0, 1, 'AnotherTestUser@test.com', 'Claim.DateSubmitted', 'asc')
        })
        .then(function (result) {
          expect(result.claims.length).toBe(1)
          expect(result.claims[0].Reference).toBe(reference)
          expect(result.claims[0].FirstName).toBe(testData.Visitor.FirstName)
          expect(result.claims[0].LastName).toBe(testData.Visitor.LastName)
          expect(result.claims[0].Name).toBe(`${testData.Visitor.FirstName} ${testData.Visitor.LastName}`)
          expect(result.claims[0].DateSubmittedFormatted.toString()).toBe(date.format('DD/MM/YYYY - HH:mm').toString())
          expect(result.claims[0].ClaimType).toBe(testData.Claim.ClaimType)
          expect(result.claims[0].AssignedTo).toBe(testData.Claim.AssignedTo)
          expect(result.claims[0].ClaimId).toBe(claimId)
          expect(result.total.Count).toBe(1)
        })
        .catch(function (error) {
          throw error
        });
    })

    it('should return no data for status with no records', function () {
      return getClaimListAndCount(['TESTING_NONE'], false, 0, 10, 'TestUser@test.com', 'Claim.DateSubmitted', 'asc')
        .then(function (result) {
          expect(result.total.Count).toBe(0)
        })
        .catch(function (error) {
          throw error
        });
    })

    it('should return no data for records assigned to another user and not past AssignmentExpiry', function () {
      return getClaimListAndCount(['TESTING'], false, 0, 1, 'AnotherTestUser@test.com', 'Claim.DateSubmitted', 'asc')
        .then(function (result) {
          expect(result.total.Count).toBe(0)
        })
        .catch(function (error) {
          throw error
        });
    })

    it('should return no data when no advance claims', function () {
      return getClaimListAndCount(['TESTING'], true, 0, 10, 'TestUser@test.com', 'Claim.DateSubmitted', 'asc')
        .then(function (result) {
          expect(result.total.Count).toBe(0)
        })
        .catch(function (error) {
          throw error
        });
    })

    afterEach(function () {
      return deleteAll(reference)
    })
  })
})
