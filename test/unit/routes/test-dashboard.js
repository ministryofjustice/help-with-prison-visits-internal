const supertest = require('supertest')
const express = require('express')
const mockViewEngine = require('./mock-view-engine')
const sinon = require('sinon')

let hasRolesStub
let getDashboardDataStub
let authorisation

jest.mock(
  '../../app/services/data/dashboard/get-dashboard-data',
  () => getDashboardDataStub
);

jest.mock('../services/authorisation', () => authorisation);

describe('routes/index', function () {
  let app

  beforeEach(function () {
    getDashboardDataStub = sinon.stub().resolves({})
    hasRolesStub = sinon.stub()
    authorisation = { hasRoles: hasRolesStub }

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
          expect(hasRolesStub.calledOnce).toBe(true) //eslint-disable-line
          expect(getDashboardDataStub.calledOnce).toBe(true) //eslint-disable-line
        });
    })
  })
})
