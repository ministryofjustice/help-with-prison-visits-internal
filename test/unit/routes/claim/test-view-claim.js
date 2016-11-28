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
var stubGetClaimLastUpdated
var stubCheckLastUpdated
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
  var app

  beforeEach(function () {
    authorisation = { isAuthenticated: sinon.stub() }
    stubGetIndividualClaimDetails = sinon.stub()
    stubSubmitClaimResponse = sinon.stub()
    stubClaimDecision = sinon.stub()
    stubGetClaimExpenseResponses = sinon.stub()
    stubGetClaimLastUpdated = sinon.stub()
    stubCheckLastUpdated = sinon.stub()

    var route = proxyquire('../../../../app/routes/claim/view-claim', {
      '../../services/authorisation': authorisation,
      '../../services/data/get-individual-claim-details': stubGetIndividualClaimDetails,
      '../../services/data/submit-claim-response': stubSubmitClaimResponse,
      '../../services/domain/claim-decision': stubClaimDecision,
      '../helpers/get-claim-expense-responses': stubGetClaimExpenseResponses,
      '../../services/data/get-claim-last-updated': stubGetClaimLastUpdated,
      '../../services/check-last-updated': stubCheckLastUpdated
    })
    app = express()
    app.use(bodyParser.json())
    mockViewEngine(app, '../../../app/views')
    app.use(function (req, res, next) {
      req.user = {
        'email': 'test@test.com',
        'first_name': 'Andrew',
        'last_name': 'Adams',
        'roles': ['caseworker', 'admin', 'sscl']
      }
      next()
    })
    route(app)
    app.use(function (err, req, res, next) {
      if (err) {
        res.status(500).render('includes/error')
      }
    })
  })

  describe('GET /claim/:claimId', function () {
    it('should respond with a 200', function () {
      stubGetIndividualClaimDetails.resolves({})

      return supertest(app)
        .get('/claim/123')
        .expect(200)
        .expect(function () {
          expect(authorisation.isAuthenticated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })
  })

  describe('POST /claim/:claimId', function () {
    it('should respond with 302 when valid data entered', function () {
      var newClaimDecision = {}
      var newClaimExpenseResponse = []
      stubGetClaimLastUpdated.resolves({})
      stubCheckLastUpdated.returns(false)
      stubSubmitClaimResponse.resolves()
      stubClaimDecision.returns(newClaimDecision)
      stubGetClaimExpenseResponses.returns(newClaimExpenseResponse)

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA)
        .expect(302)
        .expect(function () {
          expect(authorisation.isAuthenticated.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetClaimExpenseResponses.calledOnce).to.be.true
          expect(stubClaimDecision.calledOnce).to.be.true
          expect(stubSubmitClaimResponse.calledOnce).to.be.true
        })
    })

    it('should respond with 400 when last updated check returns true', function () {
      stubGetClaimLastUpdated.resolves({})
      stubCheckLastUpdated.returns(true)
      stubGetIndividualClaimDetails.resolves({})

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA)
        .expect(400)
        .expect(function () {
          expect(authorisation.isAuthenticated.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 400 when invalid data entered', function () {
      stubClaimDecision.throws(new ValidationError({ 'reason': {} }))
      stubGetIndividualClaimDetails.resolves({})
      stubGetClaimLastUpdated.resolves({})
      stubCheckLastUpdated.returns(false)

      return supertest(app)
        .post('/claim/123')
        .send(INCOMPLETE_DATA)
        .expect(400)
        .expect(function () {
          expect(authorisation.isAuthenticated.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })
  })

  describe('GET /claim/:claimId/download', function () {
    it('should respond respond with 200 if valid path entered', function () {
      return supertest(app)
        .get('/claim/123/download?path=test/resources/testfile.txt')
        .expect(200)
        .expect(function (response) {
          expect(response.header['content-length']).to.equal('4')
        })
    })

    it('should respond with 500 if no path provided', function () {
      return supertest(app)
        .get('/claim/123/download')
        .expect(500)
    })
  })
})
