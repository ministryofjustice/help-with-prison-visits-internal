const sinon = require('sinon')
const getCSVTestClaims = require('../../helpers/csv-tests/get-test-csv-claims')
const getCSVTestHeaders = require('../../helpers/csv-tests/get-test-csv-headers')
let claimJSONInput
let expectedCSVHeaders

let getCSVColumnHeaders
let getMaxNumberOfExpensesStub

jest.mock('./get-max-number-of-expenses', () => getMaxNumberOfExpensesStub);

describe('services/get-csv-column-headers', function () {
  beforeEach(function () {
    claimJSONInput = getCSVTestClaims()
    expectedCSVHeaders = getCSVTestHeaders()
    getMaxNumberOfExpensesStub = jest.fn().mockReturnValue14)
    getCSVColumnHeaders = require('../../../app/services/get-csv-column-headers')
  })

  it('should return a CSV header containing 14 expenses', function () {
    const returnedCSVHeaders = getCSVColumnHeaders(claimJSONInput)
    expect(returnedCSVHeaders).toEqual(expectedCSVHeaders)
  })
})
