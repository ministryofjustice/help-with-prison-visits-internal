const routeHelper = require('../../helpers/routes/route-helper')
const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const claimStatusEnum = require('../../../app/constants/claim-status-enum')
const sinon = require('sinon')

let getClaimsListAndCount
let displayHelperStub
let authorisation
let hasRolesStub

const RETURNED_CLAIM = {
  Reference: 'A123456',
  FirstName: 'Joe',
  LastName: 'Bloggs',
  DateSubmitted: '2016-11-29T00:00:00.000Z',
  ClaimType: 'first-time',
  ClaimId: 1,
  DateSubmittedFormatted: '28-11-2016 00:00',
  Name: 'Joe Bloggs'
}

describe('routes/index', function () {
  let app

  beforeEach(function () {
    hasRolesStub = sinon.stub()
    authorisation = { hasRoles: hasRolesStub }
    getClaimsListAndCount = sinon.stub()
    displayHelperStub = sinon.stub({ getClaimTypeDisplayName: function () {} })
    displayHelperStub.getClaimTypeDisplayName.returns('First time')

    const route = proxyquire('../../../app/routes/index', {
      '../services/authorisation': authorisation,
      '../services/data/get-claim-list-and-count': getClaimsListAndCount,
      '../views/helpers/display-helper': displayHelperStub
    })

    app = routeHelper.buildApp(route)
  })

  describe('GET /', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/')
        .expect(200)
        .expect(function () {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
        })
    })
  })

  describe('GET /claims/:status', function () {
    it('should respond with a 200', function () {
      getClaimsListAndCount.resolves({ claims: [RETURNED_CLAIM], total: { Count: 0 } })

      return supertest(app)
        .get('/claims/TEST?draw=1&start=0&length=10')
        .expect(200)
        .expect(function (response) {
          expect(hasRolesStub.calledOnce).to.be.true //eslint-disable-line
          expect(getClaimsListAndCount.calledWith(['TEST'], false, 0, 10)).to.be.true //eslint-disable-line
          expect(response.body.recordsTotal).to.equal(0)
          expect(response.body.claims[0].ClaimTypeDisplayName).to.equal('First time')
        })
    })

    it('should call for advance claims when status is ADVANCE', function () {
      getClaimsListAndCount.resolves({ claims: [RETURNED_CLAIM], total: { Count: 0 } })

      return supertest(app)
        .get('/claims/ADVANCE?draw=1&start=0&length=10')
        .expect(200)
        .expect(function (response) {
          expect(getClaimsListAndCount.calledWith([claimStatusEnum.NEW.value], true, 0, 10)).to.be.true //eslint-disable-line
        })
    })

    it('should call for approved advance claims when status is ADVANCE-APPROVED', function () {
      getClaimsListAndCount.resolves({ claims: [RETURNED_CLAIM], total: { Count: 0 } })

      return supertest(app)
        .get('/claims/ADVANCE-APPROVED?draw=1&start=0&length=10')
        .expect(200)
        .expect(function (response) {
          expect(getClaimsListAndCount.calledWith([claimStatusEnum.APPROVED.value], true, 0, 10)).to.be.true //eslint-disable-line
        })
    })

    it('should call for updated advance claims when status is ADVANCE-UPDATED', function () {
      getClaimsListAndCount.resolves({ claims: [RETURNED_CLAIM], total: { Count: 0 } })

      return supertest(app)
        .get('/claims/ADVANCE-UPDATED?draw=1&start=0&length=10')
        .expect(200)
        .expect(function (response) {
          expect(getClaimsListAndCount.calledWith([claimStatusEnum.UPDATED.value], true, 0, 10)).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 500 promise rejects', function () {
      getClaimsListAndCount.rejects()
      return supertest(app)
        .get('/claims/TEST?draw=1&start=0&length=10')
        .expect(500)
    })

    afterEach(function () {
      getClaimsListAndCount.resetHistory()
    })
  })
})
