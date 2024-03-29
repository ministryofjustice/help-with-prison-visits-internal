const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')

const mockHasRoles = jest.fn()
let mockAuthorisation
const mockGetAuditData = jest.fn()
const mockGetAllClaimsDataBelowThreshold = jest.fn()
const mockGetAllClaimsDataOverThreshold = jest.fn()
const mockUpdateReport = jest.fn()
const mockAddAuditSessionData = jest.fn()
const mockGetAuditSessionData = jest.fn()

describe('routes/audit/create-report', function () {
  let app

  beforeEach(function () {
    mockAuthorisation = {
      hasRoles: mockHasRoles
    }
    mockGetAuditData.mockResolvedValue([])
    mockGetAllClaimsDataBelowThreshold.mockResolvedValue([])
    mockGetAllClaimsDataOverThreshold.mockResolvedValue([])
    mockUpdateReport.mockResolvedValue(1)

    jest.mock('../../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock('../../../../app/services/data/audit/get-audit-data', () => mockGetAuditData)
    jest.mock(
      '../../../../app/services/data/audit/get-all-claims-data-below-threshold',
      () => mockGetAllClaimsDataBelowThreshold
    )
    jest.mock(
      '../../../../app/services/data/audit/get-all-claims-data-over-threshold',
      () => mockGetAllClaimsDataOverThreshold
    )
    jest.mock('../../../../app/services/data/audit/update-report', () => mockUpdateReport)
    jest.mock('../../../../app/services/add-audit-session-data', () => mockAddAuditSessionData)
    jest.mock('../../../../app/services/get-audit-session-data', () => mockGetAuditSessionData)

    const route = require('../../../../app/routes/audit/create-report')

    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /audit/create-report', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/audit/create-report')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAuditSessionData).toHaveBeenCalledTimes(5)
        })
    })
  })

  describe('POST /audit/create-report', function () {
    it('should respond with a 200 when reportId already exist in session', function () {
      mockGetAuditSessionData.mockResolvedValue({
        reportId: 1
      })
      return supertest(app)
        .post('/audit/create-report')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAuditSessionData).toHaveBeenCalledTimes(6)
        })
    })

    it('should respond with a 200 when reportId not exist in session', function () {
      return supertest(app)
        .post('/audit/create-report')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAuditSessionData).toHaveBeenCalledTimes(6)
          expect(mockGetAllClaimsDataBelowThreshold).toHaveBeenCalledTimes(1)
          expect(mockGetAllClaimsDataOverThreshold).toHaveBeenCalledTimes(1)
          expect(mockUpdateReport).toHaveBeenCalledTimes(1)
          expect(mockAddAuditSessionData).toHaveBeenCalledTimes(1)
        })
    })
  })
})
