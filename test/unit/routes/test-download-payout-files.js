const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const express = require('express')
const mockViewEngine = require('./mock-view-engine')
const bodyParser = require('body-parser')
const sinon = require('sinon')
require('sinon-bluebird')

var isAdmin
var getPayoutFiles

const PAYOUT_FILES = [{FilePath: 'payoutFile1'}, {FilePath: 'payoutFile2'}]

describe('routes/download-payment-files', function () {
  var app

  beforeEach(function () {
    isAdmin = sinon.stub()
    getPayoutFiles = sinon.stub().resolves(PAYOUT_FILES)

    var route = proxyquire('../../../app/routes/download-payout-files', {
      '../services/authorisation': { 'isAdmin': isAdmin },
      '../services/data/get-payout-files': getPayoutFiles
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

  describe('GET /download-payout-files', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/download-payout-files')
        .expect(200)
        .expect(function () {
          expect(isAdmin.calledOnce).to.be.true
          expect(getPayoutFiles.calledOnce).to.be.true
        })
    })

    it('should set top and previous payment files', function () {
      return supertest(app)
        .get('/download-payout-files')
        .expect(200)
        .expect(function (response) {
          expect(response.text).to.contain('"topPayoutFile":{')
          expect(response.text).to.contain('"previousPayoutFiles":[')
        })
    })
  })

  describe('GET /download-payout-files/download', function () {
    it('should respond respond with 200 if valid path entered', function () {
      return supertest(app)
        .get('/download-payout-files/download?path=test/resources/testfile.txt')
        .expect(200)
        .expect(function (response) {
          expect(isAdmin.calledOnce).to.be.true
          expect(response.header['content-length']).to.equal('4')
        })
    })

    it('should respond with 500 if no path provided', function () {
      return supertest(app)
        .get('/download-payout-files/download')
        .expect(500)
    })
  })
})
