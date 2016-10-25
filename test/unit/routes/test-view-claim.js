var supertest = require('supertest')
var expect = require('chai').expect
var proxyquire = require('proxyquire')
var express = require('express')
var mockViewEngine = require('./mock-view-engine')
var log = {
  info: function (text) {}
}
var route = proxyquire('../../../app/routes/view-claim', {
  '../services/log': log
})

describe('routes/view-claim', function () {
  var request

  beforeEach(function () {
    var app = express()

    mockViewEngine(app, '../../../app/views')

    route(app)

    request = supertest(app)
  })

  describe('GET /:ClaimId', function () {
    it('should respond with a 200', function (done) {
      request
        .get('/123')
        .expect(200, function (error) {
          expect(error).to.be.null
          done()
        })
    })
  })
})
