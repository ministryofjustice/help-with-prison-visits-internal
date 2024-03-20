const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const sinon = require('sinon')

let hasRolesStub
let authorisation
let addAuditSessionDataStub
let getAuditSessionDataStub

jest.mock('../../services/authorisation', () => authorisation);
jest.mock('../../services/add-audit-session-data', () => addAuditSessionDataStub);
jest.mock('../../services/get-audit-session-data', () => getAuditSessionDataStub);

describe('routes/audit/create-report-percent', function () {
  let app

  beforeEach(function () {
    hasRolesStub = sinon.stub()
    addAuditSessionDataStub = sinon.stub()
    getAuditSessionDataStub = sinon.stub()
    authorisation = {
      hasRoles: hasRolesStub
    }

    const route = require('../../../../app/routes/audit/create-report-percent')

    app = routeHelper.buildApp(route)
  })

  describe('GET /audit/create-report-percent', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/audit/create-report-percent')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getAuditSessionDataStub.callCount).toBe(5); //eslint-disable-line
        });
    })
  })

  describe('POST /audit/create-report-percent', function () {
    it('should respond with a 400 when no input provided', function () {
      return supertest(app)
        .post('/audit/create-report-percent')
        .expect(400)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getAuditSessionDataStub.callCount).toBe(2); //eslint-disable-line
        });
    })

    it('should respond with a 302 with valid input provided', function () {
      return supertest(app)
        .post('/audit/create-report-percent')
        .set('Accept', /json/)
        .send({
          auditReportPercent: 50
        })
        .expect(302)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(addAuditSessionDataStub.callCount).toBe(2); //eslint-disable-line
          expect(getAuditSessionDataStub.callCount).toBe(2); //eslint-disable-line
        });
    })
  })
})
