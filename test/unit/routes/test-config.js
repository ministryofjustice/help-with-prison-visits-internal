const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const express = require('express')
const mockViewEngine = require('./mock-view-engine')
const bodyParser = require('body-parser')
const sinon = require('sinon')
require('sinon-bluebird')

var isAdmin

describe('routes/config', function () {
  var app

  beforeEach(function () {
    isAdmin = sinon.stub()

    var route = proxyquire('../../../app/routes/config', {
      '../services/authorisation': { 'isAdmin': isAdmin }
    })

    app = express()
    app.use(bodyParser.json())
    mockViewEngine(app, '../../../app/views')
    route(app)
  })

  describe('GET /config', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/config')
        .expect(200)
        .expect(function () {
          expect(isAdmin.calledOnce).to.be.true
        })
    })
  })
})
