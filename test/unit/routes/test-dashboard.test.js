const supertest = require('supertest')
const express = require('express')

const mockViewEngine = require('./mock-view-engine')

let mockHasRoles
let mockGetDashboardData
let mockAuthorisation

jest.mock('../../../app/services/data/dashboard/get-dashboard-data', () => mockGetDashboardData)

jest.mock('../../../app/services/authorisation', () => mockAuthorisation)

describe('routes/index', () => {
  let app

  beforeEach(() => {
    mockGetDashboardData = jest.fn().mockResolvedValue({})
    mockHasRoles = jest.fn()
    mockAuthorisation = { hasRoles: mockHasRoles }

    const route = require('../../../app/routes/dashboard')

    app = express()
    mockViewEngine(app, '../../../app/views')
    route(app)
  })

  describe('GET /', () => {
    it('should respond with a 200', () => {
      return supertest(app)
        .get('/dashboard')
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetDashboardData).toHaveBeenCalledTimes(1)
        })
    })
  })
})
