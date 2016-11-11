const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const express = require('express')
const mockViewEngine = require('./mock-view-engine')
const sinon = require('sinon')
require('sinon-bluebird')

var getClaimsListAndCount
var authorisation

describe('routes/index', function () {
  var request
  authorisation = sinon.stub()
  getClaimsListAndCount = sinon.stub()

  beforeEach(function () {
    var route = proxyquire('../../../app/routes/index', {
      '../services/authorisation': authorisation,
      '../services/data/get-claim-list-and-count': getClaimsListAndCount
    })

    var app = express()
    mockViewEngine(app, '../../../app/views')
    route(app)
    request = supertest(app)
  })

  describe('GET /', function () {
    it('should respond with a 200', function () {
      request
        .get('/')
        .expect(200)
        .expect(function () {
          expect(getClaimsListAndCount.calledOnce).to.be.true
        })
    })
  })

  describe('GET /claims/:status', function () {
    it('should respond with a 200', function () {
      getClaimsListAndCount.resolves({claims: [], total: {Count: 0}})
      request
        .get('/claims/TEST?draw=1&start=0&length=10')
        .expect(200)
        .expect(function (error, response) {
          expect(error).to.be.null
          expect(getClaimsListAndCount.calledWith('TEST', 0, 10)).to.be.true
          expect(response.recordTotal, 0)
        })
    })
  })
})
