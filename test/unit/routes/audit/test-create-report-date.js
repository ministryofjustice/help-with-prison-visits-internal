const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
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

    const route = proxyquire('../../../../app/routes/audit/create-report-date', {
      '../../services/authorisation': authorisation,
      '../../services/data/audit/get-claim-count': getClaimCountStub,
      '../../services/data/audit/get-claim-count-over-threshold': getClaimCountOverThresholdStub,
      '../../services/data/audit/get-audit-config': getAuditConfigStub,
      '../../services/add-audit-session-data': addAuditSessionDataStub,
      '../../services/get-audit-session-data': getAuditSessionDataStub
    })

    app = routeHelper.buildApp(route)
  })

  describe('GET /audit/create-report-date', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/audit/create-report-date')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getAuditConfigStub.calledOnce).to.be.true //eslint-disable-line
        })
    })
  })

  describe('POST /audit/create-report-date', function () {
    it('should respond with a 400 when no input provided', function () {
      return supertest(app)
        .post('/audit/create-report-date')
        .expect(400)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getClaimCountStub.notCalled).to.be.true //eslint-disable-line
          expect(getClaimCountOverThresholdStub.notCalled).to.be.true //eslint-disable-line
          expect(addAuditSessionDataStub.notCalled).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 302 with valid input provided', function () {
      return supertest(app)
        .post('/audit/create-report-date')
        .set('Accept', /json/)
        .send(VALID_DATA)
        .expect(302)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getClaimCountStub.calledOnce).to.be.true //eslint-disable-line
          expect(getClaimCountOverThresholdStub.calledOnce).to.be.true //eslint-disable-line
          expect(addAuditSessionDataStub.callCount).to.equal(4); //eslint-disable-line
        })
    })
  })
})
