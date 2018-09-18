const expect = require('chai').expect
const sinon = require('sinon')
require('sinon-bluebird')
const proxyquire = require('proxyquire')
const getCSVTestClaims = require('../../helpers/csv-tests/get-test-csv-claims')
const getCSVTestHeaders = require('../../helpers/csv-tests/get-test-csv-headers')
var claimJSONInput
var expectedCSVHeaders

var getCSVColumnHeaders
var getMaxNumberOfExpensesStub

describe('services/get-csv-column-headers', function () {
  beforeEach(function () {
    claimJSONInput = getCSVTestClaims()
    expectedCSVHeaders = getCSVTestHeaders()
    getMaxNumberOfExpensesStub = sinon.stub()
    getCSVColumnHeaders = proxyquire('../../../app/services/get-csv-column-headers', {
      './servicesx/get-max-number-of-expenses': getMaxNumberOfExpensesStub
    })
  })

  it('should return a CSV header containing 14 expenses', function () {
    var returnedCSVHeaders = getCSVColumnHeaders(claimJSONInput)
    expect(returnedCSVHeaders).to.eql(expectedCSVHeaders)
  })
})