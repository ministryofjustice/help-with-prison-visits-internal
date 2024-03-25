const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')

const mockHasRoles = jest.fn()
let mockAuthorisation
const mockAddAuditSessionData = jest.fn()
const mockGetAuditSessionData = jest.fn()

describe('routes/audit/create-report-percent', function () {
  let app

  beforeEach(function () {
    mockAuthorisation = {
      hasRoles: mockHasRoles
    }

    jest.mock('../../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock('../../../../app/services/add-audit-session-data', () => mockAddAuditSessionData)
    jest.mock('../../../../app/services/get-audit-session-data', () => mockGetAuditSessionData)

    const route = require('../../../../app/routes/audit/create-report-percent')

    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /audit/create-report-percent', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/audit/create-report-percent')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAuditSessionData).toHaveBeenCalledTimes(5)
        })
    })
  })

  describe('POST /audit/create-report-percent', function () {
    it('should respond with a 400 when no input provided', function () {
      return supertest(app)
        .post('/audit/create-report-percent')
        .expect(400)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAuditSessionData).toHaveBeenCalledTimes(2)
        })
    })

    it('should respond with a 302 with valid input provided', function () {
      return supertest(app)
        .post('/audit/create-report-percent')
        .set('Accept', /json/)
        .send({
          auditReportPercent: 50
        })
        .expect(302)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockAddAuditSessionData).toHaveBeenCalledTimes(2)
          expect(mockGetAuditSessionData).toHaveBeenCalledTimes(2)
        })
    })
  })
})
