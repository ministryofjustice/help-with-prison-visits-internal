const routeHelper = require('../../helpers/routes/route-helper')
const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const ValidationError = require('../../../app/services/errors/validation-error')
const autoApprovalRulesEnum = require('../../../app/constants/auto-approval-rules-enum')

let hasRoles
let getAutoApprovalConfigStub
let getAuditConfigStub
let updateAutoApprovalConfigStub
let updateAuditConfigStub
let AutoApprovalConfigStub
let AuditConfigStub

describe('routes/config', function () {
  let app

  beforeEach(function () {
    hasRoles = sinon.stub()
    getAutoApprovalConfigStub = sinon.stub().resolves({ RulesDisabled: 'Test' })
    getAuditConfigStub = sinon.stub().resolves({})
    updateAutoApprovalConfigStub = sinon.stub().resolves()
    updateAuditConfigStub = sinon.stub().resolves()
    AutoApprovalConfigStub = sinon.stub().returns({})
    AuditConfigStub = sinon.stub().returns({})

    const route = proxyquire('../../../app/routes/config', {
      '../services/authorisation': { hasRoles },
      '../services/data/get-auto-approval-config': getAutoApprovalConfigStub,
      '../services/data/audit/get-audit-config': getAuditConfigStub,
      '../services/data/update-auto-approval-config': updateAutoApprovalConfigStub,
      '../services/data/audit/update-audit-config': updateAuditConfigStub,
      '../services/domain/auto-approval-config': AutoApprovalConfigStub,
      '../services/domain/audit-config': AuditConfigStub
    })

    app = routeHelper.buildApp(route)
    route(app)
  })

  describe('GET /config', function () {
    it('should respond with a 200 for rules disabled defined', function () {
      return supertest(app)
        .get('/config')
        .expect(200)
        .expect(function () {
          expect(hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(getAutoApprovalConfigStub.calledOnce).to.be.true //eslint-disable-line
          expect(getAuditConfigStub.calledOnce).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 200 for rules disabled not defined', function () {
      getAutoApprovalConfigStub.resolves({})
      return supertest(app)
        .get('/config')
        .expect(200)
        .expect(function () {
          expect(hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(getAutoApprovalConfigStub.calledOnce).to.be.true //eslint-disable-line
          expect(getAuditConfigStub.calledOnce).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 500 promise rejects', function () {
      getAutoApprovalConfigStub.rejects()
      return supertest(app)
        .get('/config')
        .expect(500)
    })
  })

  describe('POST /config', function () {
    it('should respond with a 302 if Audit config is passed', function () {
      return supertest(app)
        .post('/config')
        .expect(302)
        .expect(function () {
          expect(hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(updateAutoApprovalConfigStub.calledOnce).to.be.true //eslint-disable-line
          expect(updateAuditConfigStub.calledOnce).to.be.true //eslint-disable-line
          expect(AutoApprovalConfigStub.calledOnce).to.be.true //eslint-disable-line
          expect(AuditConfigStub.calledOnce).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 400 if there are validation errors', function () {
      AutoApprovalConfigStub.throws(new ValidationError())
      return supertest(app)
        .post('/config')
        .expect(400)
    })

    it('should respond with a 500 if error other than validation thrown', function () {
      updateAutoApprovalConfigStub.throws(new Error())
      return supertest(app)
        .post('/config')
        .expect(500)
    })

    it('should construct empty rulesDisabled array when all rules are enabled', function () {
      const allRules = []
      for (const rule in autoApprovalRulesEnum) {
        allRules.push(autoApprovalRulesEnum[rule].value)
      }
      const EXPECTED_RULES_DISABLED = []
      return supertest(app)
        .post('/config')
        .send({
          rules: allRules
        })
        .expect(function () {
          AutoApprovalConfigStub.calledWith(
            'test@test.com',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            EXPECTED_RULES_DISABLED)
        })
    })

    it('should construct rulesDisabled array with all rules disabled when none are enabled', function () {
      const EXPECTED_RULES_DISABLED = []
      for (const rule in autoApprovalRulesEnum) {
        EXPECTED_RULES_DISABLED.push(autoApprovalRulesEnum[rule].value)
      }
      return supertest(app)
        .post('/config')
        .send({
          rules: []
        })
        .expect(function () {
          AutoApprovalConfigStub.calledWith(
            'test@test.com',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            EXPECTED_RULES_DISABLED)
        })
    })

    it('should respond with a 500 promise rejects and update fails', function () {
      updateAutoApprovalConfigStub.rejects()
      return supertest(app)
        .post('/config')
        .expect(500)
    })
  })
})
