const supertest = require('supertest')
const routeHelper = require('../../../helpers/routes/route-helper')

const mockHasRoles = jest.fn()
let mockAuthorisation
const mockDeleteReport = jest.fn()

describe('routes/audit/delete-report', () => {
  let app

  beforeEach(() => {
    mockAuthorisation = {
      hasRoles: mockHasRoles,
    }
    mockDeleteReport.mockResolvedValue()

    jest.mock('../../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock('../../../../app/services/data/audit/delete-report', () => mockDeleteReport)

    const route = require('../../../../app/routes/audit/delete-report')

    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('POST /audit/delete-report', () => {
    it('should respond with a 400 when no input is selected', () => {
      return supertest(app)
        .post('/audit/delete-report')
        .send({
          reportId: 1,
        })
        .expect(400)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 200 when "yes" is selected', () => {
      return supertest(app)
        .post('/audit/delete-report')
        .send({
          reportId: 1,
          deleteConfirmation: 'yes',
        })
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockDeleteReport).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 302 when "no" is selected', () => {
      return supertest(app)
        .post('/audit/delete-report')
        .send({
          reportId: 1,
          deleteConfirmation: 'no',
        })
        .expect(302)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
        })
    })
  })

  describe('POST /audit/delete-report-confirmation', () => {
    it('should respond with a 200', () => {
      return supertest(app)
        .post('/audit/delete-report-confirmation')
        .send({
          reportId: 1,
        })
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
        })
    })
  })
})
