const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const express = require('express')
const mockViewEngine = require('../mock-view-engine')
const sinon = require('sinon')
require('sinon-bluebird')

var authorisation
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

describe('routes/claim/view-claim', function () {
  var request

  beforeEach(function () {
    authorisation = sinon.stub()
    stubGetIndividualClaimDetails = sinon.stub()
    stubSubmitClaimResponse = sinon.stub()
    stubClaimDecision = sinon.stub()
    stubGetClaimExpenseResponses = sinon.stub()
    var route = proxyquire('../../../../app/routes/claim/view-claim', {
      '../services/authorisation': authorisation,
      '../../services/data/get-individual-claim-details': stubGetIndividualClaimDetails,
      '../../services/data/submit-claim-response': stubSubmitClaimResponse,
      '../../services/domain/claim-decision': stubClaimDecision,
      '../helpers/get-claim-expense-responses': stubGetClaimExpenseResponses
    })

    var app = express()
    app.use(bodyParser.json())
    mockViewEngine(app, '../../../app/views')
    route(app)
    app.use(function (err, req, res, next) {
      if (err) {
        res.status(500).render('includes/error')
      }
    })
    request = supertest(app)
  })

  describe('GET /claim/:claimId', function () {
    it('should respond with a 200', function () {
      stubGetIndividualClaimDetails.resolves({})

      request
        .get('/claim/123/dsgihj,hfkjwesdhfkj')
        .expect(200)
        .expect(function () {
          expect(authorisation.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })
  })

  describe('POST /claim/:claimId', function () {
    it('should respond with 302 when valid data entered', function () {
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
        .expect(function () {
          expect(authorisation.calledOnce).to.be.true
          expect(stubGetClaimExpenseResponses.calledOnce).to.be.true
          expect(stubClaimDecision.calledOnce).to.be.true
          expect(stubSubmitClaimResponse.calledOnce).to.be.true
        })
    })

    it('should respond with 400 when invalid data entered', function () {
      stubClaimDecision.throws(new ValidationError({ 'reason': {} }))
      stubGetIndividualClaimDetails.resolves({})

      request
        .post('/claim/123')
        .send(INCOMPLETE_DATA)
        .expect(400)
        .expect(function () {
          expect(authorisation.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })
  })

  describe('GET /claim/:claimId/download', function () {
    it('should respond respond with 200 if valid path entered', function (done) {
      request
        .get('/claim/123/download?path=test/resources/testfile.txt')
        .expect(200)
        .end(function (error, response) {
          expect(error).to.be.null
          expect(response.header['content-length']).to.equal('4')
          done()
        })
    })

    it('should respond with 500 if no path provided', function (done) {
      request
        .get('/claim/123/download')
        .expect(500)
        .end(function (error, response) {
          expect(error).to.be.null
          done()
        })
    })
  })
})
