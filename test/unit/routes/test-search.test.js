const supertest = require('supertest')
const routeHelper = require('../../helpers/routes/route-helper')

const RETURNED_CLAIM = {
  Reference: 'SEARCH1',
  FirstName: 'Joe',
  LastName: 'Bloggs',
  DateSubmitted: '2016-11-29T00:00:00.000Z',
  ClaimType: 'first-time',
  ClaimId: 1,
  DateSubmittedFormatted: '28-11-2016 00:00',
  Name: 'Joe Bloggs',
}

const mockGetClaimListForSearch = jest.fn()
const mockHasRoles = jest.fn()
const mockGetClaimTypeDisplayName = jest.fn()
let mockDisplayHelper
let mockAuthorisation

describe('routes/index', () => {
  let app

  beforeEach(() => {
    mockAuthorisation = { hasRoles: mockHasRoles }
    mockDisplayHelper = { getClaimTypeDisplayName: mockGetClaimTypeDisplayName }
    mockDisplayHelper.getClaimTypeDisplayName.mockReturnValue('First time')

    jest.mock('../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock('../../../app/services/data/get-claim-list-for-search', () => mockGetClaimListForSearch)
    jest.mock('../../../app/views/helpers/display-helper', () => mockDisplayHelper)

    const route = require('../../../app/routes/search')

    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /search', () => {
    it('should respond with a 200', () => {
      return supertest(app)
        .get('/search')
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
        })
    })
  })

  describe('GET /search-results', () => {
    const draw = 1
    const start = 0
    const length = 10

    it('should respond with a 200 and pass query string to data object', () => {
      const searchQuery = 'Joe Bloggs'
      mockGetClaimListForSearch.mockResolvedValue({ claims: [RETURNED_CLAIM], total: { Count: 1 } })
      return supertest(app)
        .get(`/search-results?q=${searchQuery}&draw=${draw}&start=${start}&length=${length}`)
        .expect(200)
        .expect(response => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimListForSearch).toHaveBeenCalledWith(searchQuery, start, length)
          expect(response.body.recordsTotal).toBe(1)
          expect(response.body.claims[0].ClaimTypeDisplayName).toBe('First time')
        })
    })

    it('should not call data object when provided an empty query', () => {
      const searchQuery = ''
      return supertest(app)
        .get(`/search-results?q=${searchQuery}&draw=${draw}&start=${start}&length=${length}`)
        .expect(200)
        .expect(response => {
          expect(mockGetClaimListForSearch).not.toHaveBeenCalled()
        })
    })

    it('should respond with a 500 promise rejects', () => {
      const searchQuery = 'Joe Bloggs'
      mockGetClaimListForSearch.mockRejectedValue()
      return supertest(app)
        .get(`/search-results?q=${searchQuery}&draw=${draw}&start=${start}&length=${length}`)
        .expect(500)
    })
  })
})
