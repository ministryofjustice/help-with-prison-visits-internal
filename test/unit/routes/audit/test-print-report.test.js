const supertest = require('supertest')
const routeHelper = require('../../../helpers/routes/route-helper')

const mockHasRoles = jest.fn()
let mockAuthorisation
const mockGetReportData = jest.fn()
const mockGetReportDates = jest.fn()

describe('routes/audit/print-report', () => {
  let app

  beforeEach(() => {
    mockAuthorisation = {
      hasRoles: mockHasRoles,
    }
    mockGetReportData.mockResolvedValue({})
    mockGetReportDates.mockResolvedValue([
      {
        StartDate: '2001-01-01T23:59:59.999Z',
        EndDate: '2014-01-01T23:59:59.999Z',
      },
    ])

    jest.mock('../../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock('../../../../app/services/data/audit/get-report-data', () => mockGetReportData)
    jest.mock('../../../../app/services/data/audit/get-report-dates', () => mockGetReportDates)

    const route = require('../../../../app/routes/audit/print-report')

    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('POST /audit/print-report', () => {
    it('should respond with a 200 when there is no report data found', () => {
      mockGetReportData.mockResolvedValue()
      return supertest(app)
        .post('/audit/print-report')
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetReportData).toHaveBeenCalledTimes(1)
          expect(mockGetReportDates).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 200 when there is report data found', () => {
      mockGetReportData.mockResolvedValue([
        {
          ReportId: 1,
          Reference: 'NYD9K2Y',
          ClaimId: 28732,
          PaymentAmount: 150,
          Band5Username: 'ABC',
          Band5Validity: 'Valid',
          Band5Description: '',
          Band9Username: null,
          Band9Validity: '',
          Band9Description: null,
        },
      ])
      return supertest(app)
        .post('/audit/print-report')
        .send({
          reportId: 1,
        })
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetReportData).toHaveBeenCalledTimes(1)
          expect(mockGetReportDates).toHaveBeenCalledTimes(1)
        })
    })
  })
})
