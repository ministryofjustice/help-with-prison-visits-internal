var supertest = require('supertest')
var expect = require('chai').expect
var proxyquire = require('proxyquire')
var express = require('express')
var mockViewEngine = require('../mock-view-engine')
const sinon = require('sinon')
require('sinon-bluebird')
var getClaim

var log = {
  info: function (text) {}
}

describe('routes/claim/view-claim', function () {
  var request

  beforeEach(function (done) {
    getClaim = sinon.stub()
    var route = proxyquire('../../../../app/routes/claim/view-claim', {
      '../../services/log': log,
      '../../services/data/get-individual-claim-details': getClaim
    })

    var app = express()
    mockViewEngine(app, '../../../app/views')
    route(app)
    request = supertest(app)
    done()
  })

  describe('GET /claim/:claimId', function () {
    it('should respond with a 200', function (done) {
      getClaim.resolves({})
      request
        .get('/claim/123')
        .expect(200)
        .end(function (error, response) {
          expect(getClaim.calledWith('123')).to.be.true
          expect(error).to.be.null
          done()
        })
    })
  })
})
