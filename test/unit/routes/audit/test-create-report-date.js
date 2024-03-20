const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')

const VALID_DATA = {
  auditReportStartDateDay: '01',
  auditReportStartDateMonth: '01',
  auditReportStartDateYear: '2010',
  auditReportEndDateDay: '01',
  auditReportEndDateMonth: '01',
  auditReportEndDateYear: '2020'
}
let mockAuthorisation
const mockHasRoles = jest.fn()
const mockGetClaimCount = jest.fn()
const mockGetClaimCountOverThreshold = jest.fn()
const mockGetAuditConfig = jest.fn()
const mockAddAuditSessionData = jest.fn()
const mockGetAuditSessionData = jest.fn()

describe('routes/audit/create-report-date', function () {
  let app

  beforeEach(function () {
    mockGetClaimCount.mockResolvedValue([{ Count: 0 }])
    mockGetClaimCountOverThreshold.mockResolvedValue([{ Count: 0 }])
    mockGetAuditConfig.mockResolvedValue({ ThresholdAmount: 250 })
    mockAuthorisation = {
      hasRoles: mockHasRoles
    }

    jest.mock('../../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock('../../../../app/services/data/audit/get-claim-count', () => mockGetClaimCount)
    jest.mock(
      '../../../../app/services/data/audit/get-claim-count-over-threshold',
      () => mockGetClaimCountOverThreshold
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

  describe('GET /audit/create-report-date', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/audit/create-report-date')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetAuditConfig).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })
  })

  describe('POST /audit/create-report-date', function () {
    it('should respond with a 400 when no input provided', function () {
      return supertest(app)
        .post('/audit/create-report-date')
        .expect(400)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetClaimCount).not.toHaveBeenCalled() //eslint-disable-line
          expect(mockGetClaimCountOverThreshold).not.toHaveBeenCalled() //eslint-disable-line
          expect(mockAddAuditSessionData).not.toHaveBeenCalled() //eslint-disable-line
        })
    })

    it('should respond with a 302 with valid input provided', function () {
      return supertest(app)
        .post('/audit/create-report-date')
        .set('Accept', /json/)
        .send(VALID_DATA)
        .expect(302)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetClaimCount).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetClaimCountOverThreshold).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockAddAuditSessionData).toHaveBeenCalledTimes(4); //eslint-disable-line
        })
    })
  })
})
