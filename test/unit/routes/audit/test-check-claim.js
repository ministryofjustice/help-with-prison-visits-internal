const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')

let authorisation
const mockHasRoles = jest.fn()
const mockGetClaimData = jest.fn()
const mockUpdateClaimData = jest.fn()
const mockAddAuditSessionData = jest.fn()
const mockGetAuditSessionData = jest.fn()

describe('routes/audit/check-claim', function () {
  let app

  beforeEach(function () {
    mockGetClaimData.mockResolvedValue([{}])
    mockUpdateClaimData.mockResolvedValue()
    authorisation = {
      hasRoles: mockHasRoles
    }

    const route = require('../../../../app/routes/audit/check-claim')

    jest.mock('../../../../app/services/authorisation', () => authorisation)
    jest.mock('../../../../app/services/data/audit/get-claim-data', () => mockGetClaimData)
    jest.mock('../../../../app/services/data/audit/update-claim-data', () => mockUpdateClaimData)
    jest.mock('../../../../app/services/add-audit-session-data', () => mockAddAuditSessionData)
    jest.mock('../../../../app/services/get-audit-session-data', () => mockGetAuditSessionData)

    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /audit/check-claim', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/audit/check-claim/1/ABC123')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetClaimData).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockAddAuditSessionData).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })
  })

  describe('POST /audit/check-claim', function () {
    it('should respond with a 400 when no input is provided', function () {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .expect(400)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetAuditSessionData).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })

    it('should respond with a 400 when band 5 selects invalid but no description is provided', function () {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 5,
          band5Validation: 'Invalid'
        })
        .expect(400)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetAuditSessionData).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })

    it('should respond with a 400 when band 9 selects invalid but no description is provided', function () {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 9,
          band9Validation: 'Invalid'
        })
        .expect(400)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockGetAuditSessionData).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })

    it('should respond with a 302 when band 5 selects valid', function () {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 5,
          band5Validation: 'Valid'
        })
        .expect(302)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockUpdateClaimData).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })
    it('should respond with a 302 when band 5 selects Invalid with description', function () {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 5,
          band5Validation: 'Invalid',
          band5Description: 'desc'
        })
        .expect(302)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockUpdateClaimData).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })

    it('should respond with a 302 when band 9 selects valid', function () {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 9,
          band9Validation: 'Valid'
        })
        .expect(302)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockUpdateClaimData).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })
    it('should respond with a 302 when band 9 selects Invalid with description', function () {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 9,
          band9Validation: 'Invalid',
          band9Description: 'desc'
        })
        .expect(302)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockUpdateClaimData).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })
  })
})
