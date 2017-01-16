const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const express = require('express')
const mockViewEngine = require('./mock-view-engine')
const sinon = require('sinon')
require('sinon-bluebird')

var getClaimListForAdvancedSearch
var displayHelperStub
var authorisation
var isCaseworkerStub
var exportSearchResultsStub

const RETURNED_CLAIM = {
  Reference: 'SEARCH1',
  FirstName: 'John',
  LastName: 'Smith',
  DateSubmitted: '2016-11-29T00:00:00.000Z',
  ClaimType: 'first-time',
  ClaimId: 1,
  DateSubmittedFormatted: '28-11-2016 00:00',
  Name: 'John Smith'
}

describe('routes/index', function () {
  var app

  beforeEach(function () {
    isCaseworkerStub = sinon.stub()
    authorisation = { isCaseworker: isCaseworkerStub }
    getClaimListForAdvancedSearch = sinon.stub()
    displayHelperStub = sinon.stub({ 'getClaimTypeDisplayName': function () {} })
    displayHelperStub.getClaimTypeDisplayName.returns('First time')
    exportSearchResultsStub = sinon.stub().resolves('')

    var route = proxyquire('../../../app/routes/advanced-search', {
      '../services/authorisation': authorisation,
      '../services/data/get-claim-list-for-advanced-search': getClaimListForAdvancedSearch,
      '../views/helpers/display-helper': displayHelperStub,
      '../services/export-search-results': exportSearchResultsStub
    })

    app = express()
    mockViewEngine(app, '../../../app/views')
    route(app)
  })

  describe('GET /advanced-search-input', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/advanced-search-input')
        .expect(200)
        .expect(function () {
          expect(isCaseworkerStub.calledOnce).to.be.true
        })
    })
  })

  describe('GET /advanced-search', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/advanced-search')
        .expect(200)
        .expect(function () {
          expect(isCaseworkerStub.calledOnce).to.be.true
        })
    })
  })

  describe('GET /advanced-search-results', function () {
    var draw = 1
    var start = 0
    var length = 10

    it('should respond with a 200 and pass query object to data layer', function () {
      var searchCriteria = {
        reference: 'A123456',
        name: 'John Smith'
      }
      getClaimListForAdvancedSearch.resolves({claims: [RETURNED_CLAIM], total: {Count: 1}})
      return supertest(app)
        .get(`/advanced-search-results?reference=${searchCriteria.reference}&name=${searchCriteria.name}&draw=${draw}&start=${start}&length=${length}`)
        .expect(200)
        .expect(function (response) {
          expect(isCaseworkerStub.calledOnce).to.be.true
          expect(getClaimListForAdvancedSearch.calledWith(searchCriteria, start, length), 'expected data method to be called with parameters').to.be.true
          expect(response.body.recordsTotal).to.equal(1)
          expect(response.body.claims[0].ClaimTypeDisplayName).to.equal('First time')
        })
    })
  })

  describe('GET /advanced-search-results/export', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/advanced-search-results/export?')
        .expect(200)
        .expect(function () {
          expect(isCaseworkerStub.calledOnce).to.be.true
          expect(exportSearchResultsStub.calledOnce).to.be.true
        })
    })
  })
})
