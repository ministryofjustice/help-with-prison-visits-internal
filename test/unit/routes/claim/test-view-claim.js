var supertest = require('supertest')
var expect = require('chai').expect
var proxyquire = require('proxyquire')
var express = require('express')
var mockViewEngine = require('../mock-view-engine')
const sinon = require('sinon')
require('sinon-bluebird')
const claim = require('../../../../app/services/data/get-individual-claim-details')
const display = require('../../../../app/services/display-helpers/view-claim-display')

var log = {
  info: function (text) {}
}

describe('routes/claim/view-claim', function () {
  var request

  beforeEach(function () {
    var route = proxyquire('../../../../app/routes/claim/view-claim', {
      '../../services/log': log,
      '../../services/data/get-individual-claim-details': claim,
      '../../services/display-helpers/view-claim-display': display
    })

    var app = express()
    mockViewEngine(app, '../../../app/views')
    route(app)
    request = supertest(app)
  })

  describe('GET /claim/:claimId', function () {
    it('should respond with a 200', function (done) {
      var stubGet = sinon.stub(claim, 'get').resolves({})
      var stubDisplay = sinon.stub(display, 'get').returns([])
      request
        .get('/claim/123')
        .expect(200)
        .end(function (error, response) {
          expect(stubGet.calledOnce).to.be.true
          expect(stubDisplay.calledOnce).to.be.true
          expect(error).to.be.null
          done()
        })
    })
  })
})
