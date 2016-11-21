const mockViewEngine = require('../mock-view-engine')
const supertest = require('supertest')
const proxyquire = require('proxyquire')
const express = require('express')
const sinon = require('sinon')
const bodyParser = require('body-parser')
const ValidationError = require('../../../../app/services/errors/validation-error')
require('sinon-bluebird')

describe('routes/first-time/eligibility/claim/file-upload', function () {
  const REFERENCE = 'V123456'
  const ELIGIBILITYID = '1234'
  const CLAIMID = '1'
  const CLAIMDOCUMENTID = '1'
  const BASEROUTE = `/claim/file-upload/${REFERENCE}/${CLAIMID}/`
  const VALIDROUTE = `${BASEROUTE}VISIT_CONFIRMATION/?claimDocumentId=${CLAIMDOCUMENTID}&eligibilityId=${ELIGIBILITYID}`
  var request

  var directoryCheckStub
  var uploadStub
  var fileUploadStub
  var claimDocumentUpdateStub
  var generateCSRFTokenStub

  beforeEach(function () {
    directoryCheckStub = sinon.stub()
    uploadStub = sinon.stub()
    fileUploadStub = sinon.stub()
    claimDocumentUpdateStub = sinon.stub()
    generateCSRFTokenStub = sinon.stub()

    var route = proxyquire('../../../../app/routes/claim/file-upload', {
      '../../services/directory-check': directoryCheckStub,
      '../../services/upload': uploadStub,
      '../../services/domain/file-upload': fileUploadStub,
      '../../services/data/insert-file-upload-details-for-claim': claimDocumentUpdateStub,
      '../../services/generate-csrf-token': generateCSRFTokenStub,
      'csurf': function () { return function () { } }
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

  describe(`GET ${BASEROUTE}`, function () {
    it('should call the CSRFToken generator', function () {
      request
        .get(VALIDROUTE)
        .expect(function () {
          sinon.assert.calledOnce(generateCSRFTokenStub)
        })
    })

    it('should respond with a 200 if passed valid document type', function () {
      request
        .get(VALIDROUTE)
        .expect(200)
    })

    it('should call the directory check', function () {
      request
        .get(VALIDROUTE)
        .expect(function () {
          sinon.assert.calledOnce(directoryCheckStub)
        })
    })

    it('should respond with a 500 if passed invalid document type', function () {
      request
        .get(`${BASEROUTE}VISIT_CONFIRMATION/?claimDocumentId=${CLAIMDOCUMENTID}&eligibilityId=${ELIGIBILITYID}`)
        .expect(500)
    })
  })

  describe(`POST ${BASEROUTE}`, function () {
    it('should create a file upload object, insert it to DB and give 302', function () {
      uploadStub.callsArg(2).returns({})
      claimDocumentUpdateStub.resolves()
      request
        .post(VALIDROUTE)
        .expect(function () {
          sinon.assert.calledOnce(uploadStub)
          sinon.assert.calledOnce(fileUploadStub)
          sinon.assert.calledOnce(claimDocumentUpdateStub)
        })
        .expect(302)
    })

    it('should catch a validation error', function () {
      uploadStub.callsArg(2).returns({})
      fileUploadStub.throws(new ValidationError())
      request
        .post(VALIDROUTE)
        .expect(400)
    })

    it('should respond with a 500 if passed invalid document type', function () {
      uploadStub.callsArg(2).returns({})
      request
        .post(`${BASEROUTE}VISIT_CONFIRMATION/?claimDocumentId=${CLAIMDOCUMENTID}&eligibilityId=${ELIGIBILITYID}`)
        .expect(500)
    })
  })
})
