const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const ValidationError = require('../../../../app/services/errors/validation-error')

describe('routes/claim/update-contact-details', function () {
  const CLAIMID = '1'
  const ROUTE = `/claim/${CLAIMID}/update-contact-details`
  const REDIRECT_URL = `/claim/${CLAIMID}`

  let authorisation
  let getIndividualClaimDetails
  let UpdateContactDetailsResponse
  let updateVisitorContactDetails
  let app

  beforeEach(function () {
    authorisation = { isCaseworker: sinon.stub() }
    getIndividualClaimDetails = sinon.stub().resolves({ claim: {} })
    UpdateContactDetailsResponse = sinon.stub()
    updateVisitorContactDetails = sinon.stub().resolves()

    const route = proxyquire('../../../../app/routes/claim/update-contact-details', {
      '../../services/authorisation': authorisation,
      '../../services/data/get-individual-claim-details': getIndividualClaimDetails,
      '../../services/domain/update-contact-details-response': UpdateContactDetailsResponse,
      '../../services/data/update-visitor-contact-details': updateVisitorContactDetails
    })
    app = routeHelper.buildApp(route)
    route(app)
  })

  describe(`GET ${ROUTE}`, function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get(ROUTE)
        .expect(function () {
          sinon.assert.calledOnce(getIndividualClaimDetails)
        })
        .expect(200)
    })
  })

  describe(`POST ${ROUTE}`, function () {
    it('should respond with a 302 if domain object is built and updates successfully', function () {
      UpdateContactDetailsResponse.returns({})
      return supertest(app)
        .post(ROUTE)
        .expect(function () {
          sinon.assert.calledOnce(UpdateContactDetailsResponse)
          sinon.assert.calledOnce(updateVisitorContactDetails)
        })
        .expect('location', REDIRECT_URL)
        .expect(302)
    })

    it('should respond with a 400 if domain object validation fails.', function () {
      UpdateContactDetailsResponse.throws(new ValidationError())
      return supertest(app)
        .post(ROUTE)
        .expect(400)
    })

    it('should respond with a 500 if any non-validation error occurs.', function () {
      UpdateContactDetailsResponse.throws(new Error())
      return supertest(app)
        .post(ROUTE)
        .expect(500)
    })

    it('should respond with a 500 if promise rejects.', function () {
      updateVisitorContactDetails.rejects()
      return supertest(app)
        .post(ROUTE)
        .expect(500)
    })
  })
})
