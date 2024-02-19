const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

let hasRolesStub
let authorisation
let getReportDataStub
let getReportDatesStub

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

    const route = proxyquire('../../../../app/routes/audit/print-report', {
      '../../services/authorisation': authorisation,
      '../../services/data/audit/get-report-data': getReportDataStub,
      '../../services/data/audit/get-report-dates': getReportDatesStub
    })

    app = routeHelper.buildApp(route)
  })

  describe('POST /audit/print-report', function () {
    it('should respond with a 200 when there is no report data found', function () {
      getReportDataStub.resolves()
      return supertest(app)
        .post('/audit/print-report')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getReportDataStub.calledOnce).to.be.true //eslint-disable-line
          expect(getReportDatesStub.calledOnce).to.be.true //eslint-disable-line
        })
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
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getReportDataStub.calledOnce).to.be.true //eslint-disable-line
          expect(getReportDatesStub.calledOnce).to.be.true //eslint-disable-line
        })
    })
  })
})