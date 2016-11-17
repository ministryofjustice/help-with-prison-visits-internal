const mockViewEngine = require('../mock-view-engine')
const supertest = require('supertest')
const proxyquire = require('proxyquire')
const express = require('express')
const bodyParser = require('body-parser')
require('sinon-bluebird')

describe('routes/first-time/eligibility/claim/file-upload', function () {
  const REFERENCE = 'V123456'
  const CLAIMID = '1'
  const ROUTE = `/claim/file-upload/${REFERENCE}/${CLAIMID}?documentType=`
  var request

  beforeEach(function () {
    var route = proxyquire('../../../../app/routes/claim/file-upload', {})
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

  describe(`GET ${ROUTE}`, function () {
    it('should respond with a 200 if passed valid document type', function () {
      request
        .get(`${ROUTE}VISIT_CONFIRMATION`)
        .expect(200)
    })

    it('should respond with a 500 if passed invalid document type', function () {
      request
        .get(`${ROUTE}TEST`)
        .expect(500)
    })
  })
})
