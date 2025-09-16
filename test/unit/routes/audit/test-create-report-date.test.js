const supertest = require('supertest')
const routeHelper = require('../../../helpers/routes/route-helper')

const VALID_DATA = {
  'auditReportStartDate-Day': '01',
  'auditReportStartDate-Month': '01',
  'auditReportStartDate-Year': '2010',
  'auditReportEndDate-Day': '01',
  'auditReportEndDate-Month': '01',
  'auditReportEndDate-Year': '2020',
}
let mockAuthorisation
const mockHasRoles = jest.fn()
const mockGetClaimCount = jest.fn()
const mockGetClaimCountOverThreshold = jest.fn()
const mockGetAuditConfig = jest.fn()
const mockAddAuditSessionData = jest.fn()
const mockGetAuditSessionData = jest.fn()

describe('routes/audit/create-report-date', () => {
  let app

  beforeEach(() => {
    mockGetClaimCount.mockResolvedValue([{ Count: 0 }])
    mockGetClaimCountOverThreshold.mockResolvedValue([{ Count: 0 }])
    mockGetAuditConfig.mockResolvedValue({ ThresholdAmount: 250 })
    mockAuthorisation = {
      hasRoles: mockHasRoles,
    }

    jest.mock('../../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock('../../../../app/services/data/audit/get-claim-count', () => mockGetClaimCount)
    jest.mock(
      '../../../../app/services/data/audit/get-claim-count-over-threshold',
      () => mockGetClaimCountOverThreshold,
    )
    jest.mock('../../../../app/services/data/audit/get-audit-config', () => mockGetAuditConfig)
    jest.mock('../../../../app/services/add-audit-session-data', () => mockAddAuditSessionData)
    jest.mock('../../../../app/services/get-audit-session-data', () => mockGetAuditSessionData)

    const route = require('../../../../app/routes/audit/create-report-date')

    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /audit/create-report-date', () => {
    it('should respond with a 200', () => {
      return supertest(app)
        .get('/audit/create-report-date')
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAuditConfig).toHaveBeenCalledTimes(1)
        })
    })
  })

  describe('POST /audit/create-report-date', () => {
    it('should respond with a 400 when no input provided', () => {
      return supertest(app)
        .post('/audit/create-report-date')
        .expect(400)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimCount).not.toHaveBeenCalled()
          expect(mockGetClaimCountOverThreshold).not.toHaveBeenCalled()
          expect(mockAddAuditSessionData).not.toHaveBeenCalled()
        })
    })

    it('should respond with a 302 with valid input provided', () => {
      return supertest(app)
        .post('/audit/create-report-date')
        .set('Accept', /json/)
        .send(VALID_DATA)
        .expect(302)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimCount).toHaveBeenCalledTimes(1)
          expect(mockGetClaimCountOverThreshold).toHaveBeenCalledTimes(1)
          expect(mockAddAuditSessionData).toHaveBeenCalledTimes(4)
        })
    })
  })
})
