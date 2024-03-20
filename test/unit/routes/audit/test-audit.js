const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const sinon = require('sinon')

let hasRolesStub
let authorisation
let getAuditDataStub

jest.mock('../../services/authorisation', () => authorisation);
jest.mock('../../services/data/audit/get-audit-data', () => getAuditDataStub);

describe('routes/audit', function () {
  let app

  beforeEach(function () {
    hasRolesStub = sinon.stub()
    authorisation = {
      hasRoles: hasRolesStub
    }
    getAuditDataStub = sinon.stub().resolves([])

    const route = require('../../../../app/routes/audit/audit')

    app = routeHelper.buildApp(route)
  })

  describe('GET /audit', function () {
    it('should respond with a 200 when no audit data found', function () {
      return supertest(app)
        .get('/audit')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getAuditDataStub.calledOnce).toBe(true) //eslint-disable-line
        });
    })

    it('should respond with a 200 when audit data with check status as Completed found', function () {
      getAuditDataStub.resolves([{
        CheckStatus: 'Completed'
      }])
      return supertest(app)
        .get('/audit')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getAuditDataStub.calledOnce).toBe(true) //eslint-disable-line
        });
    })

    it('should respond with a 200 when audit data with check status is not Completed found', function () {
      getAuditDataStub.resolves([{
        CheckStatus: ''
      }])
      return supertest(app)
        .get('/audit')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getAuditDataStub.calledOnce).toBe(true) //eslint-disable-line
        });
    })

    it('should respond with a 200 when audit data with final status is Completed found', function () {
      getAuditDataStub.resolves([{
        FinalStatus: 'Completed'
      }])
      return supertest(app)
        .get('/audit')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getAuditDataStub.calledOnce).toBe(true) //eslint-disable-line
        });
    })
  })

  describe('POST /audit', function () {
    it('should respond with a 302', function () {
      return supertest(app)
        .post('/audit')
        .expect(302)
        .expect(function () {
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
        });
    })
  })
})
