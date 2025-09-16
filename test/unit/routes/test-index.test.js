const supertest = require('supertest')
const routeHelper = require('../../helpers/routes/route-helper')
const claimStatusEnum = require('../../../app/constants/claim-status-enum')

const RETURNED_CLAIM = {
  Reference: 'A123456',
  FirstName: 'Joe',
  LastName: 'Bloggs',
  DateSubmitted: '2016-11-29T00:00:00.000Z',
  ClaimType: 'first-time',
  ClaimId: 1,
  DateSubmittedFormatted: '28-11-2016 00:00',
  Name: 'Joe Bloggs',
}

const mockGetClaimsListAndCount = jest.fn()
const mockGetClaimTypeDisplayName = jest.fn()
const mockHasRoles = jest.fn()
let mockDisplayHelper
let mockAuthorisation

describe('routes/index', () => {
  let app

  beforeEach(() => {
    mockAuthorisation = { hasRoles: mockHasRoles }
    mockDisplayHelper = { getClaimTypeDisplayName: mockGetClaimTypeDisplayName }
    mockDisplayHelper.getClaimTypeDisplayName.mockReturnValue('First time')

    jest.mock('../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock('../../../app/services/data/get-claim-list-and-count', () => mockGetClaimsListAndCount)
    jest.mock('../../../app/views/helpers/display-helper', () => mockDisplayHelper)

    const route = require('../../../app/routes/index')

    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /', () => {
    it('should respond with a 200', () => {
      return supertest(app)
        .get('/')
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
        })
    })
  })

  describe('GET /claims/:status', () => {
    it('should respond with a 200', () => {
      mockGetClaimsListAndCount.mockResolvedValue({ claims: [RETURNED_CLAIM], total: { Count: 0 } })

      return supertest(app)
        .get('/claims/TEST?draw=1&start=0&length=10')
        .expect(200)
        .expect(response => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimsListAndCount).toHaveBeenCalledWith(
            ['TEST'],
            false,
            0,
            10,
            'test@test.com',
            'Claim.DateSubmitted',
            'asc',
          )
          expect(response.body.recordsTotal).toBe(0)
          expect(response.body.claims[0].ClaimTypeDisplayName).toBe('First time')
        })
    })

    it('should call for advance claims when status is ADVANCE', () => {
      mockGetClaimsListAndCount.mockResolvedValue({ claims: [RETURNED_CLAIM], total: { Count: 0 } })

      return supertest(app)
        .get('/claims/ADVANCE?draw=1&start=0&length=10')
        .expect(200)
        .expect(response => {
          expect(mockGetClaimsListAndCount).toHaveBeenCalledWith(
            [claimStatusEnum.NEW.value],
            true,
            0,
            10,
            'test@test.com',
            'Claim.DateSubmitted',
            'asc',
          )
        })
    })

    it('should call for approved advance claims when status is ADVANCE-APPROVED', () => {
      mockGetClaimsListAndCount.mockResolvedValue({ claims: [RETURNED_CLAIM], total: { Count: 0 } })

      return supertest(app)
        .get('/claims/ADVANCE-APPROVED?draw=1&start=0&length=10')
        .expect(200)
        .expect(response => {
          expect(mockGetClaimsListAndCount).toHaveBeenCalledWith(
            [claimStatusEnum.APPROVED.value],
            true,
            0,
            10,
            'test@test.com',
            'Claim.DateSubmitted',
            'asc',
          )
        })
    })

    it('should call for updated advance claims when status is ADVANCE-UPDATED', () => {
      mockGetClaimsListAndCount.mockResolvedValue({ claims: [RETURNED_CLAIM], total: { Count: 0 } })

      return supertest(app)
        .get('/claims/ADVANCE-UPDATED?draw=1&start=0&length=10')
        .expect(200)
        .expect(response => {
          expect(mockGetClaimsListAndCount).toHaveBeenCalledWith(
            [claimStatusEnum.UPDATED.value],
            true,
            0,
            10,
            'test@test.com',
            'Claim.DateSubmitted',
            'asc',
          )
        })
    })

    it('should respond with a 500 promise rejects', () => {
      mockGetClaimsListAndCount.mockRejectedValue()
      return supertest(app).get('/claims/TEST?draw=1&start=0&length=10').expect(500)
    })
  })
})
