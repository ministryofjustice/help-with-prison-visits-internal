var supertest = require('supertest')
var proxyquire = require('proxyquire')
var express = require('express')
var log = {
  info: function (text) {}
}
var route = proxyquire('../../../../app/routes/health-check/status', {
  '../services/log': log
})

describe('routes/health-check/status', function () {
  var app

  beforeEach(function () {
    app = express()
    route(app)
  })

  describe('GET /status', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/status')
        .expect(200)
    })
  })
})
