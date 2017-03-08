const routeHelper = require('../../helpers/routes/route-helper')
const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

var getClaimListForSearch
var displayHelperStub
var authorisation
var isCaseworkerStub

const RETURNED_CLAIM = {
  Reference: 'SEARCH1',
  FirstName: 'Joe',
  LastName: 'Bloggs',
  DateSubmitted: '2016-11-29T00:00:00.000Z',
  ClaimType: 'first-time',
  ClaimId: 1,
  DateSubmittedFormatted: '28-11-2016 00:00',
  Name: 'Joe Bloggs'
}

describe('routes/index', function () {
  var app

  beforeEach(function () {
    isCaseworkerStub = sinon.stub()
    authorisation = { isCaseworker: isCaseworkerStub }
    getClaimListForSearch = sinon.stub()
    displayHelperStub = sinon.stub({ 'getClaimTypeDisplayName': function () {} })
    displayHelperStub.getClaimTypeDisplayName.returns('First time')

    var route = proxyquire('../../../app/routes/search', {
      '../services/authorisation': authorisation,
      '../services/data/get-claim-list-for-search': getClaimListForSearch,
      '../views/helpers/display-helper': displayHelperStub
    })

    app = routeHelper.buildApp(route)
  })

  describe('GET /search', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/search')
        .expect(200)
        .expect(function () {
          expect(isCaseworkerStub.calledOnce).to.be.true
        })
    })
  })

  describe('GET /search-results', function () {
    var draw = 1
    var start = 0
    var length = 10

    it('should respond with a 200 and pass query string to data object', function () {
      var searchQuery = 'Joe Bloggs'
      getClaimListForSearch.resolves({claims: [RETURNED_CLAIM], total: {Count: 1}})
      return supertest(app)
        .get(`/search-results?q=${searchQuery}&draw=${draw}&start=${start}&length=${length}`)
        .expect(200)
        .expect(function (response) {
          expect(isCaseworkerStub.calledOnce).to.be.true
          expect(getClaimListForSearch.calledWith(searchQuery, start, length)).to.be.true
          expect(response.body.recordsTotal).to.equal(1)
          expect(response.body.claims[0].ClaimTypeDisplayName).to.equal('First time')
        })
    })

    it('should not call data object when provided an empty query', function () {
      var searchQuery = ''
      return supertest(app)
        .get(`/search-results?q=${searchQuery}&draw=${draw}&start=${start}&length=${length}`)
        .expect(200)
        .expect(function (response) {
          expect(getClaimListForSearch.notCalled).to.be.true
        })
    })

    it('should respond with a 500 promise rejects', function () {
      var searchQuery = 'Joe Bloggs'
      getClaimListForSearch.rejects()
      return supertest(app)
        .get(`/search-results?q=${searchQuery}&draw=${draw}&start=${start}&length=${length}`)
        .expect(500)
    })
  })
})
