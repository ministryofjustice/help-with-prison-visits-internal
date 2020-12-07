const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')

let exportSearchResults
let getClaimListForAdvancedSearchStub
let transformClaimDataForExportStub

describe('services/export-search-results', function () {
  before(function () {
    const getClaimListForAdvancedSearchResult = { claims: [], total: 0 }

    getClaimListForAdvancedSearchStub = sinon.stub().resolves(getClaimListForAdvancedSearchResult)
    transformClaimDataForExportStub = sinon.stub().resolves([])

    exportSearchResults = proxyquire('../../../app/services/export-search-results', {
      '../services/data/get-claim-list-for-advanced-search': getClaimListForAdvancedSearchStub,
      '../services/transform-claim-data-for-export': transformClaimDataForExportStub
    })
  })

  it('should call all relevant functions', function () {
    const searchCriteria = {}

    return exportSearchResults(searchCriteria)
      .then(function () {
        expect(getClaimListForAdvancedSearchStub.calledWith(searchCriteria, 0, Number.MAX_SAFE_INTEGER)).to.be.true //eslint-disable-line
        expect(transformClaimDataForExportStub.calledOnce).to.be.true //eslint-disable-line
      })
  })
})
