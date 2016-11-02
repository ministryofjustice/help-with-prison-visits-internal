var supertest = require('supertest')
var expect = require('chai').expect
var proxyquire = require('proxyquire')
var express = require('express')
var mockViewEngine = require('../mock-view-engine')
const sinon = require('sinon')
require('sinon-bluebird')
var stubGetClaim
var stubSubmitClaimResponse
var stubClaimDecision
var ValidationError = require('../../../../app/services/errors/validation-error')
var bodyParser = require('body-parser')
const VALID_DATA = {
  'decision': 'APPROVED'
}
const INCOMPLETE_DATA = {
  'decision': 'REJECTED',
  'reasonRejected': ''
}

var log = {
  info: function (text) {}
}

describe('routes/claim/view-claim', function () {
  var request

  beforeEach(function (done) {
    stubGetClaim = sinon.stub()
    stubSubmitClaimResponse = sinon.stub()
    stubClaimDecision = sinon.stub()
    var route = proxyquire('../../../../app/routes/claim/view-claim', {
      '../../services/log': log,
      '../../services/data/get-individual-claim-details': stubGetClaim,
      '../../services/data/submit-claim-response': stubSubmitClaimResponse,
      '../../services/domain/claim-decision': stubClaimDecision
    })

    var app = express()
    app.use(bodyParser.json())
    mockViewEngine(app, '../../../app/views')
    route(app)
    request = supertest(app)
    done()
  })

  describe('GET /claim/:claimId', function () {
    it('should respond with a 200', function (done) {
      stubGetClaim.resolves({})

      request
        .get('/claim/123')
        .expect(200)
        .end(function (error, response) {
          expect(stubGetClaim.calledWith('123')).to.be.true
          expect(error).to.be.null
          done()
        })
    })
  })

  describe('POST /claim/:claimId', function () {
    it('should respond with 302 when valid data entered', function (done) {
      var newClaimDecision = {}
      stubSubmitClaimResponse.resolves()
      stubClaimDecision.returns(newClaimDecision)

      request
        .post('/claim/123')
        .send(VALID_DATA)
        .expect(302)
        .end(function (error, response) {
          expect(error).to.be.null
          expect(stubClaimDecision.calledOnce).to.be.true
          expect(stubSubmitClaimResponse.calledOnce).to.be.true
          done()
        })
    })

    it('should respond with 400 when invalid data entered', function (done) {
      stubClaimDecision.throws(new ValidationError({ 'reason': {} }))
      stubGetClaim.resolves({})

      request
        .post('/claim/123')
        .send(INCOMPLETE_DATA)
        .expect(400)
        .end(function (error, response) {
          expect(error).to.be.null
          expect(stubGetClaim.calledOnce).to.be.true
          done()
        })
    })
  })
})
