const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

let hasRolesStub
let authorisation
let getAuditDataStub
let getAllClaimsDataBelowThresholdStub
let getAllClaimsDataOverThresholdStub
let updateReportStub
let addAuditSessionDataStub
let getAuditSessionDataStub

describe('routes/audit/create-report', function () {
  let app

  beforeEach(function () {
    hasRolesStub = sinon.stub()
    authorisation = {
      hasRoles: hasRolesStub
    }
    getAuditDataStub = sinon.stub().resolves([])
    getAllClaimsDataBelowThresholdStub = sinon.stub().resolves([])
    getAllClaimsDataOverThresholdStub = sinon.stub().resolves([])
    updateReportStub = sinon.stub().resolves(1)
    addAuditSessionDataStub = sinon.stub()
    getAuditSessionDataStub = sinon.stub()

    const route = proxyquire('../../../../app/routes/audit/create-report', {
      '../../services/authorisation': authorisation,
      '../../services/data/audit/get-audit-data': getAuditDataStub,
      '../../services/data/audit/get-all-claims-data-below-threshold': getAllClaimsDataBelowThresholdStub,
      '../../services/data/audit/get-all-claims-data-over-threshold': getAllClaimsDataOverThresholdStub,
      '../../services/data/audit/update-report': updateReportStub,
      '../../services/add-audit-session-data': addAuditSessionDataStub,
      '../../services/get-audit-session-data': getAuditSessionDataStub
    })

    app = routeHelper.buildApp(route)
  })

  describe('GET /audit/create-report', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/audit/create-report')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getAuditSessionDataStub.callCount).to.equal(5) //eslint-disable-line
        })
    })
  })

  describe('POST /audit/create-report', function () {
    it('should respond with a 200 when reportId already exist in session', function () {
      getAuditSessionDataStub.resolves({
        reportId: 1
      })
      return supertest(app)
        .post('/audit/create-report')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getAuditSessionDataStub.callCount).to.equal(6) //eslint-disable-line
        })
    })

    it('should respond with a 200 when reportId not exist in session', function () {
      return supertest(app)
        .post('/audit/create-report')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getAuditSessionDataStub.callCount).to.equal(6) //eslint-disable-line
          expect(getAllClaimsDataBelowThresholdStub.calledOnce).to.be.true //eslint-disable-line
          expect(getAllClaimsDataOverThresholdStub.calledOnce).to.be.true //eslint-disable-line
          expect(updateReportStub.calledOnce).to.be.true //eslint-disable-line
          expect(addAuditSessionDataStub.calledOnce).to.be.true //eslint-disable-line
        })
    })
  })
})
