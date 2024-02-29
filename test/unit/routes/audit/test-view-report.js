const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

let hasRolesStub
let authorisation
let getReportDataStub
let getReportDatesStub
let getAuditConfigStub
let setForVerificationStub
let updateAuditStatusStub

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

    const route = proxyquire('../../../../app/routes/audit/view-report', {
      '../../services/authorisation': authorisation,
      '../../services/data/audit/get-report-data': getReportDataStub,
      '../../services/data/audit/get-report-dates': getReportDatesStub,
      '../../services/data/audit/get-audit-config': getAuditConfigStub,
      '../../services/data/audit/set-for-verification': setForVerificationStub,
      '../../services/data/audit/update-audit-data': updateAuditStatusStub
    })

    app = routeHelper.buildApp(route)
  })

  describe('GET /audit/view-report', function () {
    it('should respond with a 200 when there is no report data', function () {
      getReportDataStub.resolves()
      return supertest(app)
        .get('/audit/view-report/1')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getReportDataStub.calledOnce).to.be.true //eslint-disable-line
          expect(getReportDatesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getAuditConfigStub.notCalled).to.be.true //eslint-disable-line
          expect(updateAuditStatusStub.notCalled).to.be.true //eslint-disable-line
          expect(setForVerificationStub.notCalled).to.be.true //eslint-disable-line
        })
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
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getReportDataStub.calledOnce).to.be.true //eslint-disable-line
          expect(getReportDatesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getAuditConfigStub.calledOnce).to.be.true //eslint-disable-line
          expect(updateAuditStatusStub.calledOnce).to.be.true //eslint-disable-line
          expect(setForVerificationStub.notCalled).to.be.true //eslint-disable-line
        })
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
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getReportDataStub.calledTwice).to.be.true //eslint-disable-line
          expect(getReportDatesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getAuditConfigStub.calledOnce).to.be.true //eslint-disable-line
          expect(updateAuditStatusStub.calledOnce).to.be.true //eslint-disable-line
          expect(setForVerificationStub.calledOnce).to.be.true //eslint-disable-line
        })
    })
  })
})
