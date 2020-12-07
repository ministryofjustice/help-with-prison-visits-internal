const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const getCSVTestClaims = require('../../helpers/csv-tests/get-test-csv-claims')
const getCSVTestHeaders = require('../../helpers/csv-tests/get-test-csv-headers')
let claimJSONInput
let expectedCSVHeaders

let getCSVColumnHeaders
let getMaxNumberOfExpensesStub

describe('services/get-csv-column-headers', function () {
  beforeEach(function () {
    claimJSONInput = getCSVTestClaims()
    expectedCSVHeaders = getCSVTestHeaders()
    getMaxNumberOfExpensesStub = sinon.stub().returns(14)
    getCSVColumnHeaders = proxyquire('../../../app/services/get-csv-column-headers', {
      './get-max-number-of-expenses': getMaxNumberOfExpensesStub
    })
  })

  it('should return a CSV header containing 14 expenses', function () {
    const returnedCSVHeaders = getCSVColumnHeaders(claimJSONInput)
    expect(returnedCSVHeaders).to.eql(expectedCSVHeaders)
  })
})
