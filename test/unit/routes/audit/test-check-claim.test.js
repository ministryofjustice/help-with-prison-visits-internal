const supertest = require('supertest')
const routeHelper = require('../../../helpers/routes/route-helper')

let mockAuthorisation
const mockHasRoles = jest.fn()
const mockGetClaimData = jest.fn()
const mockUpdateClaimData = jest.fn()
const mockAddAuditSessionData = jest.fn()
const mockGetAuditSessionData = jest.fn()

describe('routes/audit/check-claim', () => {
  let app

  beforeEach(() => {
    mockGetClaimData.mockResolvedValue([{}])
    mockUpdateClaimData.mockResolvedValue()
    mockAuthorisation = {
      hasRoles: mockHasRoles,
    }

    const route = require('../../../../app/routes/audit/check-claim')

    jest.mock('../../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock('../../../../app/services/data/audit/get-claim-data', () => mockGetClaimData)
    jest.mock('../../../../app/services/data/audit/update-claim-data', () => mockUpdateClaimData)
    jest.mock('../../../../app/services/add-audit-session-data', () => mockAddAuditSessionData)
    jest.mock('../../../../app/services/get-audit-session-data', () => mockGetAuditSessionData)

    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /audit/check-claim', () => {
    it('should respond with a 200', () => {
      return supertest(app)
        .get('/audit/check-claim/1/ABC123')
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimData).toHaveBeenCalledTimes(1)
          expect(mockAddAuditSessionData).toHaveBeenCalledTimes(1)
        })
    })
  })

  describe('POST /audit/check-claim', () => {
    it('should respond with a 400 when no input is provided', () => {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .expect(400)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAuditSessionData).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 400 when band 5 selects invalid but no description is provided', () => {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 5,
          band5Validation: 'Invalid',
        })
        .expect(400)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAuditSessionData).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 400 when band 9 selects invalid but no description is provided', () => {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 9,
          band9Validation: 'Invalid',
        })
        .expect(400)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetAuditSessionData).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 302 when band 5 selects valid', () => {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 5,
          band5Validation: 'Valid',
        })
        .expect(302)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockUpdateClaimData).toHaveBeenCalledTimes(1)
        })
    })
    it('should respond with a 302 when band 5 selects Invalid with description', () => {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 5,
          band5Validation: 'Invalid',
          band5Description: 'desc',
        })
        .expect(302)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockUpdateClaimData).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 302 when band 9 selects valid', () => {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 9,
          band9Validation: 'Valid',
        })
        .expect(302)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockUpdateClaimData).toHaveBeenCalledTimes(1)
        })
    })
    it('should respond with a 302 when band 9 selects Invalid with description', () => {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 9,
          band9Validation: 'Invalid',
          band9Description: 'desc',
        })
        .expect(302)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockUpdateClaimData).toHaveBeenCalledTimes(1)
        })
    })
  })
})
