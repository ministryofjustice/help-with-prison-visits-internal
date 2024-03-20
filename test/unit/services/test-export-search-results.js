let exportSearchResults
let mockGetClaimListForAdvancedSearch
let mockTransformClaimDataForExport

jest.mock(
  '../../../app/services/data/get-claim-list-for-advanced-search',
  () => mockGetClaimListForAdvancedSearch
)

jest.mock(
  '../../../app/services/transform-claim-data-for-export',
  () => mockTransformClaimDataForExport
)

describe('services/export-search-results', function () {
  beforeAll(function () {
    const getClaimListForAdvancedSearchResult = { claims: [], total: 0 }

    mockGetClaimListForAdvancedSearch = jest.fn().mockResolvedValue(getClaimListForAdvancedSearchResult)
    mockTransformClaimDataForExport = jest.fn().mockResolvedValue([])

    exportSearchResults = require('../../../app/services/export-search-results')
  })

  it('should call all relevant functions', function () {
    const searchCriteria = {}

    return exportSearchResults(searchCriteria)
      .then(function () {
        expect(mockGetClaimListForAdvancedSearch.calledWith(searchCriteria, 0, Number.MAX_SAFE_INTEGER)).toBe(true) //eslint-disable-line
        expect(mockTransformClaimDataForExport).toHaveBeenCalledTimes(1) //eslint-disable-line
      })
  })
})
