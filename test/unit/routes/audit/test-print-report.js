const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const sinon = require('sinon')

let hasRolesStub
let authorisation
let getReportDataStub
let getReportDatesStub

jest.mock('../../services/authorisation', () => authorisation);
jest.mock('../../services/data/audit/get-report-data', () => getReportDataStub);
jest.mock('../../services/data/audit/get-report-dates', () => getReportDatesStub);

describe('routes/audit/print-report', function () {
  let app

  beforeEach(function () {
    hasRolesStub = sinon.stub()
    authorisation = {
      hasRoles: hasRolesStub
    }
    getReportDataStub = sinon.stub().resolves({})
    getReportDatesStub = sinon.stub().resolves([{
      StartDate: '2001-01-01T23:59:59.999Z',
      EndDate: '2014-01-01T23:59:59.999Z'
    }])

    const route = require('../../../../app/routes/audit/print-report')

    app = routeHelper.buildApp(route)
  })

  describe('POST /audit/print-report', function () {
    it('should respond with a 200 when there is no report data found', function () {
      getReportDataStub.resolves()
      return supertest(app)
        .post('/audit/print-report')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getReportDataStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getReportDatesStub.calledOnce).toBe(true) //eslint-disable-line
        });
    })

    it('should respond with a 200 when there is report data found', function () {
      getReportDataStub.resolves([{
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
        .post('/audit/print-report')
        .send({
          reportId: 1
        })
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getReportDataStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getReportDatesStub.calledOnce).toBe(true) //eslint-disable-line
        });
    })
  })
})
