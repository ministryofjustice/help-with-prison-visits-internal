const sinon = require('sinon')

let exportSearchResults
let getClaimListForAdvancedSearchStub
let transformClaimDataForExportStub

jest.mock(
  '../services/data/get-claim-list-for-advanced-search',
  () => getClaimListForAdvancedSearchStub
);

jest.mock(
  '../services/transform-claim-data-for-export',
  () => transformClaimDataForExportStub
);

describe('services/export-search-results', function () {
  beforeAll(function () {
    const getClaimListForAdvancedSearchResult = { claims: [], total: 0 }

    getClaimListForAdvancedSearchStub = sinon.stub().resolves(getClaimListForAdvancedSearchResult)
    transformClaimDataForExportStub = sinon.stub().resolves([])

    exportSearchResults = require('../../../app/services/export-search-results')
  })

  it('should call all relevant functions', function () {
    const searchCriteria = {}

    return exportSearchResults(searchCriteria)
      .then(function () {
        expect(getClaimListForAdvancedSearchStub.calledWith(searchCriteria, 0, Number.MAX_SAFE_INTEGER)).toBe(true) //eslint-disable-line
        expect(transformClaimDataForExportStub.calledOnce).toBe(true) //eslint-disable-line
      });
  })
})
