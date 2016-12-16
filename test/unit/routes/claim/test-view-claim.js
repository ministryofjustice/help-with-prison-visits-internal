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
var stubInsertDeduction
var stubDisableDeduction
var stubClaimDeduction
var stubGetClaimDocumentFilePath
var stubUpdateClaimOverpaymentStatus
var stubOverpaymentResponse
var stubCloseAdvanceClaim
var ValidationError = require('../../../../app/services/errors/validation-error')
var deductionTypeEnum = require('../../../../app/constants/deduction-type-enum')
var bodyParser = require('body-parser')
const VALID_CLAIMEXPENSE_DATA = [{claimExpenseId: '1', approvedCost: '20.00', cost: '20.00', status: 'APPROVED'}]
const VALID_DATA_APPROVE = {
  'decision': 'APPROVED',
  'claimExpenses': VALID_CLAIMEXPENSE_DATA
}
const VALID_DATA_ADD_DEDUCTION = {
  'add-deduction': 'Submit',
  deductionType: deductionTypeEnum.HC3_DEDUCTION.value,
  deductionAmount: '1'
}
const VALID_DATA_DISABLE_DEDUCTION = {
  'remove-deduction-1': 'Remove'
}
const VALID_DATA_UPDATE_OVERPAYMENT_STATUS = {
  'overpayment-amount': '20',
  'overpayment-reason': 'cos',
  'closed-claim-action': 'OVERPAYMENT'
}
const VALID_DATA_CLOSE_ADVANCE_CLAIM = {
  'closed-claim-action': 'CLOSE-ADVANCE-CLAIM',
  'close-advance-claim-reason': 'close advance claim reason'
}
const INCOMPLETE_DATA = {
  'decision': 'REJECTED',
  'reasonRejected': '',
  'claimExpense': []
}

describe('routes/claim/view-claim', function () {
  var app

  beforeEach(function () {
    authorisation = { isCaseworker: sinon.stub() }
    stubGetIndividualClaimDetails = sinon.stub()
    stubSubmitClaimResponse = sinon.stub()
    stubClaimDecision = sinon.stub()
    stubGetClaimExpenseResponses = sinon.stub()
    stubGetClaimLastUpdated = sinon.stub()
    stubCheckLastUpdated = sinon.stub()
    stubInsertDeduction = sinon.stub()
    stubDisableDeduction = sinon.stub()
    stubClaimDeduction = sinon.stub()
    stubGetClaimDocumentFilePath = sinon.stub()
    stubUpdateClaimOverpaymentStatus = sinon.stub()
    stubOverpaymentResponse = sinon.stub()
    stubCloseAdvanceClaim = sinon.stub()

    var route = proxyquire('../../../../app/routes/claim/view-claim', {
      '../../services/authorisation': authorisation,
      '../../services/data/get-individual-claim-details': stubGetIndividualClaimDetails,
      '../../services/data/submit-claim-response': stubSubmitClaimResponse,
      '../../services/domain/claim-decision': stubClaimDecision,
      '../helpers/get-claim-expense-responses': stubGetClaimExpenseResponses,
      '../../services/data/get-claim-last-updated': stubGetClaimLastUpdated,
      '../../services/check-last-updated': stubCheckLastUpdated,
      '../../services/data/insert-deduction': stubInsertDeduction,
      '../../services/data/disable-deduction': stubDisableDeduction,
      '../../services/domain/claim-deduction': stubClaimDeduction,
      '../../services/data/get-claim-document-file-path': stubGetClaimDocumentFilePath,
      '../../services/data/update-claim-overpayment-status': stubUpdateClaimOverpaymentStatus,
      '../../services/domain/overpayment-response': stubOverpaymentResponse,
      '../../services/data/close-advance-claim': stubCloseAdvanceClaim
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
          expect(authorisation.isCaseworker.calledOnce).to.be.true
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
        .send(VALID_DATA_APPROVE)
        .expect(302)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
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
        .send(VALID_DATA_APPROVE)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
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
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 302 when valid data entered (add deduction)', function () {
      var testClaimDecisionObject = {deductionType: 'a', amount: '5'}
      stubGetClaimLastUpdated.resolves({})
      stubCheckLastUpdated.returns(false)
      stubInsertDeduction.resolves({})
      stubClaimDeduction.returns(testClaimDecisionObject)

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(302)
        .expect(function () {
          expect(stubInsertDeduction.calledWith('123', testClaimDecisionObject)).to.be.true
        })
    })

    it('should respond with 302 when valid data entered (disable deduction)', function () {
      stubGetClaimLastUpdated.resolves({})
      stubCheckLastUpdated.returns(false)
      stubDisableDeduction.resolves({})

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(302)
        .expect(function () {
          expect(stubDisableDeduction.calledWith('1')).to.be.true
        })
    })
  })

  describe('GET /claim/:claimId/download', function () {
    const CLAIM_DOCUMENT = {
      Filepath: 'test/resources/testfile.txt'
    }

    it('should respond respond with 200 if a valid file path is returned', function () {
      stubGetClaimDocumentFilePath.resolves(CLAIM_DOCUMENT)
      return supertest(app)
        .get('/claim/123/download?claim-document-id=55')
        .expect(200)
        .expect('content-length', '4')
    })

    it('should respond with 500 if no claim-document-id provided', function () {
      return supertest(app)
        .get('/claim/123/download')
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/close-claim-action', function () {
    it('should respond with 302 when valid data entered (add overpayment)', function () {
      var claimData = { claim: { IsOverpaid: false } }
      var overpaymentResponse = {}
      stubGetIndividualClaimDetails.resolves(claimData)
      stubOverpaymentResponse.returns(overpaymentResponse)
      stubUpdateClaimOverpaymentStatus.resolves()

      return supertest(app)
        .post('/claim/123/closed-claim-action')
        .send(VALID_DATA_UPDATE_OVERPAYMENT_STATUS)
        .expect(302)
        .expect(function () {
          expect(stubUpdateClaimOverpaymentStatus.calledWith(claimData.claim, overpaymentResponse)).to.be.true
        })
    })

    it('should respond with 302 when valid data entered (close advance claim)', function () {
      stubCloseAdvanceClaim.resolves()

      return supertest(app)
        .post('/claim/123/closed-claim-action')
        .send(VALID_DATA_CLOSE_ADVANCE_CLAIM)
        .expect(302)
        .expect(function () {
          expect(stubCloseAdvanceClaim.calledWith('123', 'close advance claim reason')).to.be.true
        })
    })
  })
})
