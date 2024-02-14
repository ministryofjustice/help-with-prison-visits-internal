const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

let hasRolesStub
let authorisation
let getClaimDataStub
let updateClaimDataStub
let addAuditSessionDataStub
let getAuditSessionDataStub

describe('routes/audit/check-claim', function () {
  let app

  beforeEach(function () {
    hasRolesStub = sinon.stub()
    getClaimDataStub = sinon.stub().resolves([{}])
    updateClaimDataStub = sinon.stub().resolves()
    addAuditSessionDataStub = sinon.stub()
    getAuditSessionDataStub = sinon.stub()
    authorisation = {
      hasRoles: hasRolesStub
    }

    const route = proxyquire('../../../../app/routes/audit/check-claim', {
      '../../services/authorisation': authorisation,
      '../../services/data/audit/get-claim-data': getClaimDataStub,
      '../../services/data/audit/update-claim-data': updateClaimDataStub,
      '../../services/add-audit-session-data': addAuditSessionDataStub,
      '../../services/get-audit-session-data': getAuditSessionDataStub
    })

    app = routeHelper.buildApp(route)
  })

  describe('GET /audit/check-claim', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/audit/check-claim/1/ABC123')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getClaimDataStub.calledOnce).to.be.true //eslint-disable-line
          expect(addAuditSessionDataStub.calledOnce).to.be.true //eslint-disable-line
        })
    })
  })

  describe('POST /audit/check-claim', function () {
    it('should respond with a 400 when no input is provided', function () {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .expect(400)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getAuditSessionDataStub.calledOnce).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 400 when band 5 selects invalid but no description is provided', function () {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 5,
          band5Validation: 'Invalid'
        })
        .expect(400)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getAuditSessionDataStub.calledOnce).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 400 when band 9 selects invalid but no description is provided', function () {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 9,
          band9Validation: 'Invalid'
        })
        .expect(400)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getAuditSessionDataStub.calledOnce).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 302 when band 5 selects valid', function () {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 5,
          band5Validation: 'Valid'
        })
        .expect(302)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(updateClaimDataStub.calledOnce).to.be.true //eslint-disable-line
        })
    })
    it('should respond with a 302 when band 5 selects Invalid with description', function () {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 5,
          band5Validation: 'Invalid',
          band5Description: 'desc'
        })
        .expect(302)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(updateClaimDataStub.calledOnce).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 302 when band 9 selects valid', function () {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 9,
          band9Validation: 'Valid'
        })
        .expect(302)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(updateClaimDataStub.calledOnce).to.be.true //eslint-disable-line
        })
    })
    it('should respond with a 302 when band 9 selects Invalid with description', function () {
      return supertest(app)
        .post('/audit/check-claim/1/ABC123')
        .set('Accept', /json/)
        .send({
          band: 9,
          band9Validation: 'Invalid',
          band9Description: 'desc'
        })
        .expect(302)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(updateClaimDataStub.calledOnce).to.be.true //eslint-disable-line
        })
    })
  })
})
