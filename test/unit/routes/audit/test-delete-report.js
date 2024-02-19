const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

let hasRolesStub
let authorisation
let deleteReportStub

describe('routes/audit/delete-report', function () {
  let app

  beforeEach(function () {
    hasRolesStub = sinon.stub()
    authorisation = {
      hasRoles: hasRolesStub
    }
    deleteReportStub = sinon.stub().resolves()
    const route = proxyquire('../../../../app/routes/audit/delete-report', {
      '../../services/authorisation': authorisation,
      '../../services/data/audit/delete-report': deleteReportStub
    })

    app = routeHelper.buildApp(route)
  })

  describe('POST /audit/delete-report', function () {
    it('should respond with a 400 when no input is selected', function () {
      return supertest(app)
        .post('/audit/delete-report')
        .send({
          reportId: 1
        })
        .expect(400)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 200 when "yes" is selected', function () {
      return supertest(app)
        .post('/audit/delete-report')
        .send({
          reportId: 1,
          deleteConfirmation: 'yes'
        })
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(deleteReportStub.calledOnce).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 302 when "no" is selected', function () {
      return supertest(app)
        .post('/audit/delete-report')
        .send({
          reportId: 1,
          deleteConfirmation: 'no'
        })
        .expect(302)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
        })
    })
  })

  describe('POST /audit/delete-report-confirmation', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .post('/audit/delete-report-confirmation')
        .send({
          reportId: 1
        })
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
        })
    })
  })
})