const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const sinon = require('sinon')

const VALID_DATA = {
  auditReportStartDateDay: '01',
  auditReportStartDateMonth: '01',
  auditReportStartDateYear: '2010',
  auditReportEndDateDay: '01',
  auditReportEndDateMonth: '01',
  auditReportEndDateYear: '2020'
}
let hasRolesStub
let authorisation
let getClaimCountStub
let getClaimCountOverThresholdStub
let getAuditConfigStub
let addAuditSessionDataStub
let getAuditSessionDataStub

jest.mock('../../services/authorisation', () => authorisation);
jest.mock('../../services/data/audit/get-claim-count', () => getClaimCountStub);

jest.mock(
  '../../services/data/audit/get-claim-count-over-threshold',
  () => getClaimCountOverThresholdStub
);

jest.mock('../../services/data/audit/get-audit-config', () => getAuditConfigStub);
jest.mock('../../services/add-audit-session-data', () => addAuditSessionDataStub);
jest.mock('../../services/get-audit-session-data', () => getAuditSessionDataStub);

describe('routes/audit/create-report-date', function () {
  let app

  beforeEach(function () {
    hasRolesStub = sinon.stub()
    getClaimCountStub = sinon.stub().resolves([{
      Count: 0
    }])
    getClaimCountOverThresholdStub = sinon.stub().resolves([{
      Count: 0
    }])
    getAuditConfigStub = sinon.stub().resolves({
      ThresholdAmount: 250
    })
    addAuditSessionDataStub = sinon.stub()
    getAuditSessionDataStub = sinon.stub()
    authorisation = {
      hasRoles: hasRolesStub
    }

    const route = require('../../../../app/routes/audit/create-report-date')

    app = routeHelper.buildApp(route)
  })

  describe('GET /audit/create-report-date', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/audit/create-report-date')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getAuditConfigStub.calledOnce).toBe(true) //eslint-disable-line
        });
    })
  })

  describe('POST /audit/create-report-date', function () {
    it('should respond with a 400 when no input provided', function () {
      return supertest(app)
        .post('/audit/create-report-date')
        .expect(400)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getClaimCountStub.notCalled).toBe(true) //eslint-disable-line
          expect(getClaimCountOverThresholdStub.notCalled).toBe(true) //eslint-disable-line
          expect(addAuditSessionDataStub.notCalled).toBe(true) //eslint-disable-line
        });
    })

    it('should respond with a 302 with valid input provided', function () {
      return supertest(app)
        .post('/audit/create-report-date')
        .set('Accept', /json/)
        .send(VALID_DATA)
        .expect(302)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getClaimCountStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getClaimCountOverThresholdStub.calledOnce).toBe(true) //eslint-disable-line
          expect(addAuditSessionDataStub.callCount).toBe(4); //eslint-disable-line
        });
    })
  })
})
