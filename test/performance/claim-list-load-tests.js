var expect = require('chai').expect
const perfTestHelper = require('../helpers/performance-test-helper')
var getClaimsListAndCount = require('../../app/services/data/get-claim-list-and-count')

const DEFAULT_CLAIM_LIST_SIZE = 500
const DEFAULT_APPROVED_CLAIM_SIZE = 10000
const LIST_QUERY_MAX_TIME_MS = 1000

describe('Test performance of claim list queries under a known record load', () => {
  before(function () {
    console.log('Deleting any existing data in IntSchema')
    return perfTestHelper.deleteAll()
      .then(function () {
        console.log('Inserting ' + DEFAULT_CLAIM_LIST_SIZE + ' NEW claim records')
        return perfTestHelper.insertTestDataBatch(0, 'NEW', DEFAULT_CLAIM_LIST_SIZE, false, false)
          .then(function (maxId) {
            console.log('Inserting ' + DEFAULT_CLAIM_LIST_SIZE + ' UPDATED claim records')
            return perfTestHelper.insertTestDataBatch(maxId, 'UPDATED', DEFAULT_CLAIM_LIST_SIZE, false, false)
          })
          .then(function (maxId) {
            console.log('Inserting ' + DEFAULT_CLAIM_LIST_SIZE + ' PENDING claim records')
            return perfTestHelper.insertTestDataBatch(maxId, 'PENDING', DEFAULT_CLAIM_LIST_SIZE, false, false)
          })
          .then(function (maxId) {
            console.log('Inserting ' + DEFAULT_CLAIM_LIST_SIZE + ' ADVANCE claim records')
            return perfTestHelper.insertTestDataBatch(maxId, 'NEW', DEFAULT_CLAIM_LIST_SIZE, true, false)
          })
          .then(function (maxId) {
            console.log('Inserting ' + DEFAULT_CLAIM_LIST_SIZE + ' ADVANCE APPROVED claim records')
            return perfTestHelper.insertTestDataBatch(maxId, 'APPROVED', DEFAULT_CLAIM_LIST_SIZE, true, false)
          })
          .then(function (maxId) {
            console.log('Inserting ' + DEFAULT_CLAIM_LIST_SIZE + ' ADVANCE UPDATED claim records')
            return perfTestHelper.insertTestDataBatch(maxId, 'UPDATED', DEFAULT_CLAIM_LIST_SIZE, true, false)
          })
          .then(function (maxId) {
            console.log('Inserting ' + DEFAULT_APPROVED_CLAIM_SIZE + ' APPROVED claim records')
            return perfTestHelper.insertTestDataBatch(maxId, 'APPROVED', DEFAULT_APPROVED_CLAIM_SIZE, false, false)
          })
      })
  })

  it('should return NEW records list and count', function () {
    var start = process.hrtime()
    return getClaimsListAndCount('NEW', false, 0, 10).then(function (result) {
      var diff = process.hrtime(start)
      expect(result.total.Count).to.equal(DEFAULT_CLAIM_LIST_SIZE)
      expect(result.claims.length).to.equal(10)
      console.log('Execution time: %ds %dms', diff[0], diff[1] / 1000000)
      expect(diff[1] / 1000000).to.be.lessThan(LIST_QUERY_MAX_TIME_MS)
    })
  })

  it('should return UPDATED records list and count', function () {
    var start = process.hrtime()
    return getClaimsListAndCount('UPDATED', false, 0, 10).then(function (result) {
      var diff = process.hrtime(start)
      expect(result.total.Count).to.equal(DEFAULT_CLAIM_LIST_SIZE)
      expect(result.claims.length).to.equal(10)
      console.log('Execution time: %ds %dms', diff[0], diff[1] / 1000000)
      expect(diff[1] / 1000000).to.be.lessThan(LIST_QUERY_MAX_TIME_MS)
    })
  })

  it('should return PENDING records list and count', function () {
    var start = process.hrtime()
    return getClaimsListAndCount('PENDING', false, 0, 10).then(function (result) {
      var diff = process.hrtime(start)
      expect(result.total.Count).to.equal(DEFAULT_CLAIM_LIST_SIZE)
      expect(result.claims.length).to.equal(10)
      console.log('Execution time: %ds %dms', diff[0], diff[1] / 1000000)
      expect(diff[1] / 1000000).to.be.lessThan(LIST_QUERY_MAX_TIME_MS)
    })
  })

  it('should return ADVANCE records list and count', function () {
    var start = process.hrtime()
    return getClaimsListAndCount('NEW', true, 0, 10).then(function (result) {
      var diff = process.hrtime(start)
      expect(result.total.Count).to.equal(DEFAULT_CLAIM_LIST_SIZE)
      expect(result.claims.length).to.equal(10)
      console.log('Execution time: %ds %dms', diff[0], diff[1] / 1000000)
      expect(diff[1] / 1000000).to.be.lessThan(LIST_QUERY_MAX_TIME_MS)
    })
  })

  it('should return ADVANCE APPROVED records list and count', function () {
    var start = process.hrtime()
    return getClaimsListAndCount('APPROVED', true, 0, 10).then(function (result) {
      var diff = process.hrtime(start)
      expect(result.total.Count).to.equal(DEFAULT_CLAIM_LIST_SIZE)
      expect(result.claims.length).to.equal(10)
      console.log('Execution time: %ds %dms', diff[0], diff[1] / 1000000)
      expect(diff[1] / 1000000).to.be.lessThan(LIST_QUERY_MAX_TIME_MS)
    })
  })

  it('should return ADVANCE UPDATED records list and count', function () {
    var start = process.hrtime()
    return getClaimsListAndCount('UPDATED', true, 0, 10).then(function (result) {
      var diff = process.hrtime(start)
      expect(result.total.Count).to.equal(DEFAULT_CLAIM_LIST_SIZE)
      expect(result.claims.length).to.equal(10)
      console.log('Execution time: %ds %dms', diff[0], diff[1] / 1000000)
      expect(diff[1] / 1000000).to.be.lessThan(LIST_QUERY_MAX_TIME_MS)
    })
  })

  after(function () {
    return perfTestHelper.deleteAll().then(function () {
      console.log('Tear down of performance test data complete')
    })
  })
})
