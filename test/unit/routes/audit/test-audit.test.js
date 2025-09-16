const supertest = require('supertest')
const routeHelper = require('../../../helpers/routes/route-helper')

let mockAuthorisation
const mockHasRoles = jest.fn()
const mockGetAuditData = jest.fn()

describe('routes/audit', () => {
  let app

  beforeEach(() => {
    mockAuthorisation = {
      hasRoles: mockHasRoles,
    }
    mockGetAuditData.mockResolvedValue([])

    jest.mock('../../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock('../../../../app/services/data/audit/get-audit-data', () => mockGetAuditData)

    const route = require('../../../../app/routes/audit/audit')

    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /audit', () => {
    it('should respond with a 200 when no audit data found', () => {
      return supertest(app)
        .get('/audit')
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAuditData).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 200 when audit data with check status as Completed found', () => {
      mockGetAuditData.mockResolvedValue([
        {
          CheckStatus: 'Completed',
        },
      ])
      return supertest(app)
        .get('/audit')
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAuditData).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 200 when audit data with check status is not Completed found', () => {
      mockGetAuditData.mockResolvedValue([
        {
          CheckStatus: '',
        },
      ])
      return supertest(app)
        .get('/audit')
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAuditData).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 200 when audit data with final status is Completed found', () => {
      mockGetAuditData.mockResolvedValue([
        {
          FinalStatus: 'Completed',
        },
      ])
      return supertest(app)
        .get('/audit')
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAuditData).toHaveBeenCalledTimes(1)
        })
    })
  })

  describe('POST /audit', () => {
    it('should respond with a 302', () => {
      return supertest(app)
        .post('/audit')
        .expect(302)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
        })
    })
  })
})
