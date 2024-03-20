const routeHelper = require('../../helpers/routes/route-helper')
const supertest = require('supertest')
const sinon = require('sinon')

let getClaimListForSearch
let displayHelperStub
let authorisation
let hasRolesStub

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

jest.mock('../services/authorisation', () => authorisation);
jest.mock('../services/data/get-claim-list-for-search', () => getClaimListForSearch);
jest.mock('../views/helpers/display-helper', () => displayHelperStub);

describe('routes/index', function () {
  let app

  beforeEach(function () {
    hasRolesStub = sinon.stub()
    authorisation = { hasRoles: hasRolesStub }
    getClaimListForSearch = sinon.stub()
    displayHelperStub = sinon.stub({ getClaimTypeDisplayName: function () {} })
    displayHelperStub.getClaimTypeDisplayName.returns('First time')

    const route = require('../../../app/routes/search')

    app = routeHelper.buildApp(route)
  })

  describe('GET /search', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/search')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
        });
    })
  })

  describe('GET /search-results', function () {
    const draw = 1
    const start = 0
    const length = 10

    it('should respond with a 200 and pass query string to data object', function () {
      const searchQuery = 'Joe Bloggs'
      getClaimListForSearch.resolves({ claims: [RETURNED_CLAIM], total: { Count: 1 } })
      return supertest(app)
        .get(`/search-results?q=${searchQuery}&draw=${draw}&start=${start}&length=${length}`)
        .expect(200)
        .expect(function (response) {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getClaimListForSearch.calledWith(searchQuery, start, length)).toBe(true) //eslint-disable-line
          expect(response.body.recordsTotal).toBe(1)
          expect(response.body.claims[0].ClaimTypeDisplayName).toBe('First time')
        });
    })

    it('should not call data object when provided an empty query', function () {
      const searchQuery = ''
      return supertest(app)
        .get(`/search-results?q=${searchQuery}&draw=${draw}&start=${start}&length=${length}`)
        .expect(200)
        .expect(function (response) {
          expect(getClaimListForSearch.notCalled).toBe(true) //eslint-disable-line
        });
    })

    it('should respond with a 500 promise rejects', function () {
      const searchQuery = 'Joe Bloggs'
      getClaimListForSearch.rejects()
      return supertest(app)
        .get(`/search-results?q=${searchQuery}&draw=${draw}&start=${start}&length=${length}`)
        .expect(500)
    })
  })
})
