var supertest = require('supertest')
var expect = require('chai').expect
var proxyquire = require('proxyquire')
var express = require('express')
var mockViewEngine = require('../mock-view-engine')
const sinon = require('sinon')
require('sinon-bluebird')
var stubGetIndividualClaimDetails
var stubSubmitClaimResponse
var stubClaimDecision
var stubGetClaimExpenseResponses
var ValidationError = require('../../../../app/services/errors/validation-error')
var bodyParser = require('body-parser')
const VALID_CLAIMEXPENSE_DATA = [{claimExpenseId: '1', approvedCost: '20.00', cost: '20.00', status: 'APPROVED'}]
const VALID_DATA = {
  'decision': 'APPROVED',
  'claimExpenses': VALID_CLAIMEXPENSE_DATA
}
const INCOMPLETE_DATA = {
  'decision': 'REJECTED',
  'reasonRejected': '',
  'claimExpense': []
}

var log = {
  info: function (text) {}
}

describe('routes/claim/view-claim', function () {
  var request

  beforeEach(function (done) {
    stubGetIndividualClaimDetails = sinon.stub()
    stubSubmitClaimResponse = sinon.stub()
    stubClaimDecision = sinon.stub()
    stubGetClaimExpenseResponses = sinon.stub()
    var route = proxyquire('../../../../app/routes/claim/view-claim', {
      '../../services/log': log,
      '../../services/data/get-individual-claim-details': stubGetIndividualClaimDetails,
      '../../services/data/submit-claim-response': stubSubmitClaimResponse,
      '../../services/domain/claim-decision': stubClaimDecision,
      '../helpers/get-claim-expense-responses': stubGetClaimExpenseResponses
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
      stubGetIndividualClaimDetails.resolves({})

      request
        .get('/claim/123')
        .expect(200)
        .end(function (error, response) {
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
          expect(error).to.be.null
          done()
        })
    })
  })

  describe('POST /claim/:claimId', function () {
    it('should respond with 302 when valid data entered', function (done) {
      var newClaimDecision = {}
      var newClaimExpenseResponse = []

      stubSubmitClaimResponse.resolves()
      stubClaimDecision.returns(newClaimDecision)
      stubGetClaimExpenseResponses.returns(newClaimExpenseResponse)
      stubGetIndividualClaimDetails.resolves({})

      request
        .post('/claim/123')
        .send(VALID_DATA)
        .expect(302)
        .end(function (error, response) {
          expect(error).to.be.null
          expect(stubGetClaimExpenseResponses.calledOnce).to.be.true
          expect(stubClaimDecision.calledOnce).to.be.true
          expect(stubSubmitClaimResponse.calledOnce).to.be.true
          done()
        })
    })

    it('should respond with 400 when invalid data entered', function (done) {
      stubClaimDecision.throws(new ValidationError({ 'reason': {} }))
      stubGetIndividualClaimDetails.resolves({})

      request
        .post('/claim/123')
        .send(INCOMPLETE_DATA)
        .expect(400)
        .end(function (error, response) {
          expect(error).to.be.null
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
          done()
        })
    })
  })
})
