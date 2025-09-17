const getCSVTestClaims = require('../../helpers/csv-tests/get-test-csv-claims')
const getCSVTestHeaders = require('../../helpers/csv-tests/get-test-csv-headers')

let claimJSONInput
let expectedCSVHeaders

let getCSVColumnHeaders
let mockGetMaxNumberOfExpenses

jest.mock('../../../app/services/get-max-number-of-expenses', () => mockGetMaxNumberOfExpenses)

describe('services/get-csv-column-headers', () => {
  beforeEach(() => {
    claimJSONInput = getCSVTestClaims()
    expectedCSVHeaders = getCSVTestHeaders()
    mockGetMaxNumberOfExpenses = jest.fn().mockReturnValue(14)
    getCSVColumnHeaders = require('../../../app/services/get-csv-column-headers')
  })

  it('should return a CSV header containing 14 expenses', () => {
    const returnedCSVHeaders = getCSVColumnHeaders(claimJSONInput)
    expect(returnedCSVHeaders).toEqual(expectedCSVHeaders)
  })
})
