const supertest = require('supertest')
const express = require('express')
const mockViewEngine = require('./mock-view-engine')

let mockHasRoles
let getDashboardDataStub
let authorisation

jest.mock(
  '../../app/services/data/dashboard/get-dashboard-data',
  () => getDashboardDataStub
)

jest.mock('../services/authorisation', () => authorisation)

describe('routes/index', function () {
  let app

  beforeEach(function () {
    getDashboardDataStub = jest.fn().mockResolvedValue({})
    mockHasRoles = jest.fn()
    authorisation = { hasRoles: mockHasRoles }

    const route = require('../../../app/routes/dashboard')

    app = express()
    mockViewEngine(app, '../../../app/views')
    route(app)
  })

  describe('GET /', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/dashboard')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(getDashboardDataStub).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })
  })
})
