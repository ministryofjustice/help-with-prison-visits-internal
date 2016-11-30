const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const express = require('express')
const mockViewEngine = require('./mock-view-engine')
const bodyParser = require('body-parser')
const sinon = require('sinon')
require('sinon-bluebird')

var isSscl
var getDirectPaymentFiles

const DIRECT_PAYMENT_FILES = {
  accessPayFiles: [{FilePath: 'accessPayFile1'}, {FilePath: 'accessPayFile2'}],
  adiJournalFiles: [{FilePath: 'adiJournalFile1'}, {FilePath: 'adiJournalFile2'}]
}

describe('routes/download-payment-files', function () {
  var app

  beforeEach(function () {
    isSscl = sinon.stub()
    getDirectPaymentFiles = sinon.stub().resolves(DIRECT_PAYMENT_FILES)

    var route = proxyquire('../../../app/routes/download-payment-files', {
      '../services/authorisation': { 'isSscl': isSscl },
      '../services/data/get-direct-payment-files': getDirectPaymentFiles
    })

    app = express()
    app.use(bodyParser.json())
    mockViewEngine(app, '../../../app/views')
    route(app)
    app.use(function (err, req, res, next) {
      if (err) {
        res.status(500).render('includes/error')
      }
    })
  })

  describe('GET /download-payment-files', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/download-payment-files')
        .expect(200)
        .expect(function () {
          expect(isSscl.calledOnce).to.be.true
          expect(getDirectPaymentFiles.calledOnce).to.be.true
        })
    })

    it('should set top and previous payment files', function () {
      return supertest(app)
        .get('/download-payment-files')
        .expect(200)
        .expect(function (response) {
          expect(response.text).to.contain('"topAccessPayFile":{')
          expect(response.text).to.contain('"previousAccessPayFiles":[')
          expect(response.text).to.contain('"topAdiJournalFile":{')
          expect(response.text).to.contain('"previousAdiJournalFiles":[')
        })
    })
  })

  describe('GET /download-payment-files/download', function () {
    it('should respond respond with 200 if valid path entered', function () {
      return supertest(app)
        .get('/download-payment-files/download?path=test/resources/testfile.txt')
        .expect(200)
        .expect(function (response) {
          expect(isSscl.calledOnce).to.be.true
          expect(response.header['content-length']).to.equal('4')
        })
    })

    it('should respond with 500 if no path provided', function () {
      return supertest(app)
        .get('/download-payment-files/download')
        .expect(500)
    })
  })
})
