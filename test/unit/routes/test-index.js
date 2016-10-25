var supertest = require('supertest')
var expect = require('chai').expect
var proxyquire = require('proxyquire')
var express = require('express')
var mockViewEngine = require('./mock-view-engine')
const sinon = require('sinon')
require('sinon-bluebird')
const claims = require('../../../app/services/data/get-claims-by-status')

var log = {
  info: function (text) {}
}

describe('routes/index', function () {
  var request

  beforeEach(function () {
    var route = proxyquire('../../../app/routes/index', {
      '../services/log': log,
      '../../services/data/get-claims-by-status': claims
    })

    var app = express()
    mockViewEngine(app, '../../../app/views')
    route(app)
    request = supertest(app)
  })

  describe('GET /', function () {
    it('should respond with a 200', function (done) {
      var stubGet = sinon.stub(claims, 'get').resolves([])
      request
        .get('/')
        .expect(200)
        .end(function (error, response) {
          expect(stubGet.calledOnce).to.be.true
          expect(error).to.be.null
          done()
        })
    })
  })
})
