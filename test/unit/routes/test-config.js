const supertest = require('supertest')
const routeHelper = require('../../helpers/routes/route-helper')
const ValidationError = require('../../../app/services/errors/validation-error')
const autoApprovalRulesEnum = require('../../../app/constants/auto-approval-rules-enum')

let mockAuthorisation
const mockHasRoles = jest.fn()
const mockGetAutoApprovalConfig = jest.fn()
const mockGetAuditConfig = jest.fn()
const mockUpdateAutoApprovalConfig = jest.fn()
const mockUpdateAuditConfig = jest.fn()
const mockAutoApprovalConfig = jest.fn()
const mockAuditConfig = jest.fn()

describe('routes/config', function () {
  let app

  beforeEach(function () {
    mockAuthorisation = {
      hasRoles: mockHasRoles
    }
    mockGetAutoApprovalConfig.mockResolvedValue({ RulesDisabled: 'Test' })
    mockGetAuditConfig.mockResolvedValue({})
    mockUpdateAutoApprovalConfig.mockResolvedValue()
    mockUpdateAuditConfig.mockResolvedValue()
    mockAutoApprovalConfig.mockReturnValue({})
    mockAuditConfig.mockReturnValue({})

    jest.mock('../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock(
      '../../../app/services/data/get-auto-approval-config',
      () => mockGetAutoApprovalConfig
    )
    jest.mock('../../../app/services/data/audit/get-audit-config', () => mockGetAuditConfig)
    jest.mock(
      '../../../app/services/data/update-auto-approval-config',
      () => mockUpdateAutoApprovalConfig
    )
    jest.mock('../../../app/services/data/audit/update-audit-config', () => mockUpdateAuditConfig)
    jest.mock('../../../app/services/domain/auto-approval-config', () => mockAutoApprovalConfig)
    jest.mock('../../../app/services/domain/audit-config', () => mockAuditConfig)

    const route = require('../../../app/routes/config')

    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /config', function () {
    it('should respond with a 200 for rules disabled defined', function () {
      return supertest(app)
        .get('/config')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAutoApprovalConfig).toHaveBeenCalledTimes(1)
          expect(mockGetAuditConfig).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 200 for rules disabled not defined', function () {
      mockGetAutoApprovalConfig.mockResolvedValue({})
      return supertest(app)
        .get('/config')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAutoApprovalConfig).toHaveBeenCalledTimes(1)
          expect(mockGetAuditConfig).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 500 promise rejects', function () {
      mockGetAutoApprovalConfig.mockRejectedValue()
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
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockUpdateAutoApprovalConfig).toHaveBeenCalledTimes(1)
          expect(mockUpdateAuditConfig).toHaveBeenCalledTimes(1)
          expect(mockAutoApprovalConfig).toHaveBeenCalledTimes(1)
          expect(mockAuditConfig).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 400 if there are validation errors', function () {
      mockAutoApprovalConfig.mockImplementation(() => { throw new ValidationError() })
      return supertest(app)
        .post('/config')
        .expect(400)
    })

    it('should respond with a 500 if error other than validation thrown', function () {
      mockUpdateAutoApprovalConfig.mockImplementation(() => { throw new Error() })
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
          rulesEnabled: allRules
        })
        .expect(function () {
          expect(mockAutoApprovalConfig).toHaveBeenCalledWith(
            'test@test.com',
            undefined,
            undefined,
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
          rulesEnabled: []
        })
        .expect(function () {
          expect(mockAutoApprovalConfig).toHaveBeenCalledWith(
            'test@test.com',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            EXPECTED_RULES_DISABLED)
        })
    })

    it('should respond with a 500 promise rejects and update fails', function () {
      mockUpdateAutoApprovalConfig.mockRejectedValue()
      return supertest(app)
        .post('/config')
        .expect(500)
    })
  })
})
