const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')

const mockHasRoles = jest.fn()
let authorisation
const mockGetReportData = jest.fn()
const mockGetReportDates = jest.fn()
const mockGetAuditConfig = jest.fn()
const mockSetForVerification = jest.fn()
const mockUpdateAuditStatus = jest.fn()

describe('routes/audit/view-report', function () {
  let app

  beforeEach(function () {
    authorisation = {
      hasRoles: mockHasRoles
    }
    mockGetReportDates.mockResolvedValue([{
      StartDate: '2001-01-01T23:59:59.999Z',
      EndDate: '2014-01-01T23:59:59.999Z'
    }])
    mockGetAuditConfig.mockResolvedValue({
      AuditConfigId: 1,
      ThresholdAmount: 150,
      VerificationPercent: 20,
      DateCreated: '2024-02-08T21:42:33.940Z'
    })
    mockSetForVerification.mockResolvedValue({})
    mockUpdateAuditStatus.mockResolvedValue()

    jest.mock('../../../../app/services/authorisation', () => authorisation)
    jest.mock('../../../../app/services/data/audit/get-report-data', () => mockGetReportData)
    jest.mock('../../../../app/services/data/audit/get-report-dates', () => mockGetReportDates)
    jest.mock('../../../../app/services/data/audit/get-audit-config', () => mockGetAuditConfig)
    jest.mock(
      '../../../../app/services/data/audit/set-for-verification',
      () => mockSetForVerification
    )
    jest.mock('../../../../app/services/data/audit/update-audit-data', () => mockUpdateAuditStatus)

    const route = require('../../../../app/routes/audit/view-report')

    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /audit/view-report', function () {
    it('should respond with a 200 when there is no report data', function () {
      mockGetReportData.mockResolvedValue()
      return supertest(app)
        .get('/audit/view-report/1')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetReportData).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetReportDates).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetAuditConfig).not.toHaveBeenCalled() //eslint-disable-line
          expect(mockUpdateAuditStatus).not.toHaveBeenCalled() //eslint-disable-line
          expect(mockSetForVerification).not.toHaveBeenCalled() //eslint-disable-line
        })
    })

    it('should respond with a 200 when there is report data and verification is not set', function () {
      mockGetReportData.mockResolvedValue([{
        ReportId: 1,
        Reference: 'NYD9K2Y',
        ClaimId: 28732,
        PaymentAmount: 150,
        Band5Username: 'ABC',
        Band5Validity: 'Valid',
        Band5Description: '',
        Band9Username: null,
        Band9Validity: 'Not verified',
        Band9Description: null
      }])
      return supertest(app)
        .get('/audit/view-report/1')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetReportData).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetReportDates).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetAuditConfig).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockUpdateAuditStatus).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockSetForVerification).not.toHaveBeenCalled() //eslint-disable-line
        })
    })

    it('should respond with a 200 when there is report data and verification is set', function () {
      mockGetReportData.mockResolvedValue([{
        ReportId: 1,
        Reference: 'NYD9K2Y',
        ClaimId: 28732,
        PaymentAmount: 150,
        Band5Username: 'ABC',
        Band5Validity: 'Valid',
        Band5Description: '',
        Band9Username: null,
        Band9Validity: '',
        Band9Description: null
      }])
      return supertest(app)
        .get('/audit/view-report/1')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetReportData).toHaveBeenCalledTimes(2) //eslint-disable-line
          expect(mockGetReportDates).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetAuditConfig).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockUpdateAuditStatus).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockSetForVerification).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })
  })
})
