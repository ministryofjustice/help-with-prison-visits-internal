const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const sinon = require('sinon')

let hasRolesStub
let authorisation
let getReportDataStub
let getReportDatesStub
let getAuditConfigStub
let setForVerificationStub
let updateAuditStatusStub

jest.mock('../../services/authorisation', () => authorisation);
jest.mock('../../services/data/audit/get-report-data', () => getReportDataStub);
jest.mock('../../services/data/audit/get-report-dates', () => getReportDatesStub);
jest.mock('../../services/data/audit/get-audit-config', () => getAuditConfigStub);

jest.mock(
  '../../services/data/audit/set-for-verification',
  () => setForVerificationStub
);

jest.mock('../../services/data/audit/update-audit-data', () => updateAuditStatusStub);

describe('routes/audit/view-report', function () {
  let app

  beforeEach(function () {
    hasRolesStub = sinon.stub()
    authorisation = {
      hasRoles: hasRolesStub
    }
    getReportDataStub = sinon.stub()
    getReportDatesStub = sinon.stub().resolves([{
      StartDate: '2001-01-01T23:59:59.999Z',
      EndDate: '2014-01-01T23:59:59.999Z'
    }])
    getAuditConfigStub = sinon.stub().resolves({
      AuditConfigId: 1,
      ThresholdAmount: 150,
      VerificationPercent: 20,
      DateCreated: '2024-02-08T21:42:33.940Z'
    })
    setForVerificationStub = sinon.stub().resolves({})
    updateAuditStatusStub = sinon.stub().resolves()

    const route = require('../../../../app/routes/audit/view-report')

    app = routeHelper.buildApp(route)
  })

  describe('GET /audit/view-report', function () {
    it('should respond with a 200 when there is no report data', function () {
      getReportDataStub.resolves()
      return supertest(app)
        .get('/audit/view-report/1')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getReportDataStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getReportDatesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getAuditConfigStub.notCalled).toBe(true) //eslint-disable-line
          expect(updateAuditStatusStub.notCalled).toBe(true) //eslint-disable-line
          expect(setForVerificationStub.notCalled).toBe(true) //eslint-disable-line
        });
    })

    it('should respond with a 200 when there is report data and verification is not set', function () {
      getReportDataStub.resolves([{
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
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getReportDataStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getReportDatesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getAuditConfigStub.calledOnce).toBe(true) //eslint-disable-line
          expect(updateAuditStatusStub.calledOnce).toBe(true) //eslint-disable-line
          expect(setForVerificationStub.notCalled).toBe(true) //eslint-disable-line
        });
    })

    it('should respond with a 200 when there is report data and verification is set', function () {
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
        .get('/audit/view-report/1')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getReportDataStub.calledTwice).toBe(true) //eslint-disable-line
          expect(getReportDatesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getAuditConfigStub.calledOnce).toBe(true) //eslint-disable-line
          expect(updateAuditStatusStub.calledOnce).toBe(true) //eslint-disable-line
          expect(setForVerificationStub.calledOnce).toBe(true) //eslint-disable-line
        });
    })
  })
})
