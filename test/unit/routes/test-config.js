const routeHelper = require('../../helpers/routes/route-helper')
const supertest = require('supertest')
const ValidationError = require('../../../app/services/errors/validation-error')
const autoApprovalRulesEnum = require('../../../app/constants/auto-approval-rules-enum')

let hasRoles
let getAutoApprovalConfigStub
let mockGetAuditConfig
let updateAutoApprovalConfigStub
let updateAuditConfigStub
let AutoApprovalConfigStub
let AuditConfigStub

jest.mock('../services/authorisation', () => ({
  hasRoles
}))

jest.mock(
  '../services/data/get-auto-approval-config',
  () => getAutoApprovalConfigStub
)

jest.mock('../services/data/audit/get-audit-config', () => mockGetAuditConfig)

jest.mock(
  '../services/data/update-auto-approval-config',
  () => updateAutoApprovalConfigStub
)

jest.mock('../services/data/audit/update-audit-config', () => updateAuditConfigStub)
jest.mock('../services/domain/auto-approval-config', () => AutoApprovalConfigStub)
jest.mock('../services/domain/audit-config', () => AuditConfigStub)

describe('routes/config', function () {
  let app

  beforeEach(function () {
    hasRoles = jest.fn()
    getAutoApprovalConfigStub = jest.fn().mockResolvedValue({ RulesDisabled: 'Test' })
    mockGetAuditConfig = jest.fn().mockResolvedValue({})
    updateAutoApprovalConfigStub = jest.fn().mockResolvedValue()
    updateAuditConfigStub = jest.fn().mockResolvedValue()
    AutoApprovalConfigStub = jest.fn().mockReturnValue({})
    AuditConfigStub = jest.fn().mockReturnValue({})

    const route = require('../../../app/routes/config')

    app = routeHelper.buildApp(route)
    route(app)
  })

  describe('GET /config', function () {
    it('should respond with a 200 for rules disabled defined', function () {
      return supertest(app)
        .get('/config')
        .expect(200)
        .expect(function () {
          expect(hasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(getAutoApprovalConfigStub).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetAuditConfig).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })

    it('should respond with a 200 for rules disabled not defined', function () {
      getAutoApprovalConfigStub.mockResolvedValue({})
      return supertest(app)
        .get('/config')
        .expect(200)
        .expect(function () {
          expect(hasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(getAutoApprovalConfigStub).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetAuditConfig).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })

    it('should respond with a 500 promise rejects', function () {
      getAutoApprovalConfigStub.mockRejectedValue()
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
          expect(hasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(updateAutoApprovalConfigStub).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(updateAuditConfigStub).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(AutoApprovalConfigStub).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(AuditConfigStub).toHaveBeenCalledTimes(1) //eslint-disable-line
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
      updateAutoApprovalConfigStub.mockRejectedValue()
      return supertest(app)
        .post('/config')
        .expect(500)
    })
  })
})
