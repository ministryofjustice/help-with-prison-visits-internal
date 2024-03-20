const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const sinon = require('sinon')
const ValidationError = require('../../../../app/services/errors/validation-error')

jest.mock('../../services/authorisation', () => authorisation);

jest.mock(
  '../../services/data/get-individual-claim-details',
  () => getIndividualClaimDetails
);

jest.mock(
  '../../services/domain/update-contact-details-response',
  () => UpdateContactDetailsResponse
);

jest.mock(
  '../../services/data/update-visitor-contact-details',
  () => updateVisitorContactDetails
);

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
    authorisation = { hasRoles: sinon.stub() }
    getIndividualClaimDetails = sinon.stub().resolves({ claim: {} })
    UpdateContactDetailsResponse = sinon.stub()
    updateVisitorContactDetails = sinon.stub().resolves()

    const route = require('../../../../app/routes/claim/update-contact-details')
    app = routeHelper.buildApp(route)
    route(app)
  })

  describe(`GET ${ROUTE}`, function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get(ROUTE)
        .expect(function () {
          sinon.toHaveBeenCalledTimes(1)
        })
        .expect(200);
    })
  })

  describe(`POST ${ROUTE}`, function () {
    it('should respond with a 302 if domain object is built and updates successfully', function () {
      UpdateContactDetailsResponse.returns({})
      return supertest(app)
        .post(ROUTE)
        .expect(function () {
          sinon.toHaveBeenCalledTimes(1)
          sinon.toHaveBeenCalledTimes(1)
        })
        .expect('location', REDIRECT_URL)
        .expect(302);
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
