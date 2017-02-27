const routeHelper = require('../../helpers/routes/route-helper')
const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')
const ValidationError = require('../../../app/services/errors/validation-error')
const autoApprovalRulesEnum = require('../../../app/constants/auto-approval-rules-enum')

var isAdmin
var getAutoApprovalConfigStub
var updateAutoApprovalConfigStub
var AutoApprovalConfigStub

describe('routes/config', function () {
  var app

  beforeEach(function () {
    isAdmin = sinon.stub()
    getAutoApprovalConfigStub = sinon.stub().resolves({ RulesDisabled: '' })
    updateAutoApprovalConfigStub = sinon.stub().resolves()
    AutoApprovalConfigStub = sinon.stub().returns({})

    var route = proxyquire('../../../app/routes/config', {
      '../services/authorisation': { 'isAdmin': isAdmin },
      '../services/data/get-auto-approval-config': getAutoApprovalConfigStub,
      '../services/data/update-auto-approval-config': updateAutoApprovalConfigStub,
      '../services/domain/auto-approval-config': AutoApprovalConfigStub
    })

    app = routeHelper.buildApp(route)
    route(app)
  })

  describe('GET /config', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/config')
        .expect(200)
        .expect(function () {
          expect(isAdmin.calledOnce).to.be.true
          expect(getAutoApprovalConfigStub.calledOnce).to.be.true
        })
    })
  })

  describe('POST /config', function () {
    it('should respond with a 302', function () {
      return supertest(app)
        .post('/config')
        .expect(302)
        .expect(function () {
          expect(isAdmin.calledOnce).to.be.true
          expect(updateAutoApprovalConfigStub.calledOnce).to.be.true
          expect(AutoApprovalConfigStub.calledOnce).to.be.true
        })
    })

    it('should respond with a 400 if there are validation errors', function () {
      AutoApprovalConfigStub.throws(new ValidationError())
      return supertest(app)
        .post('/config')
        .expect(400)
    })

    it('should construct empty rulesDisabled array when all rules are enabled', function () {
      var allRules = []
      for (var rule in autoApprovalRulesEnum) {
        allRules.push(autoApprovalRulesEnum[rule].value)
      }
      const EXPECTED_RULES_DISABLED = []
      return supertest(app)
        .post('/config')
        .send({
          'rules': allRules
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
      var EXPECTED_RULES_DISABLED = []
      for (var rule in autoApprovalRulesEnum) {
        EXPECTED_RULES_DISABLED.push(autoApprovalRulesEnum[rule].value)
      }
      return supertest(app)
        .post('/config')
        .send({
          'rules': []
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
  })
})
