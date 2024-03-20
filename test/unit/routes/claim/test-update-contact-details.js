const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const ValidationError = require('../../../../app/services/errors/validation-error')

let authorisation
const mockGetIndividualClaimDetails = jest.fn()
const mockUpdateContactDetailsResponse = jest.fn()
const mockUpdateVisitorContactDetails = jest.fn()
const mockHasRoles = jest.fn()
let app

describe('routes/claim/update-contact-details', function () {
  const CLAIMID = '1'
  const ROUTE = `/claim/${CLAIMID}/update-contact-details`
  const REDIRECT_URL = `/claim/${CLAIMID}`

  beforeEach(function () {
    authorisation = { hasRoles: mockHasRoles }
    mockGetIndividualClaimDetails.mockResolvedValue({ claim: {} })
    mockUpdateVisitorContactDetails.mockResolvedValue()

    jest.mock('../../../../app/services/authorisation', () => authorisation)
    jest.mock(
      '../../../../app/services/data/get-individual-claim-details',
      () => mockGetIndividualClaimDetails
    )
    jest.mock(
      '../../../../app/services/domain/update-contact-details-response',
      () => mockUpdateContactDetailsResponse
    )
    jest.mock(
      '../../../../app/services/data/update-visitor-contact-details',
      () => mockUpdateVisitorContactDetails
    )

    const route = require('../../../../app/routes/claim/update-contact-details')
    app = routeHelper.buildApp(route)
    route(app)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe(`GET ${ROUTE}`, function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get(ROUTE)
        .expect(function () {
          mockGetIndividualClaimDetails.toHaveBeenCalledTimes(1)
        })
        .expect(200)
    })
  })

  describe(`POST ${ROUTE}`, function () {
    it('should respond with a 302 if domain object is built and updates successfully', function () {
      mockUpdateContactDetailsResponse.mockReturnValue({})
      return supertest(app)
        .post(ROUTE)
        .expect(function () {
          mockUpdateContactDetailsResponse.toHaveBeenCalledTimes(1)
          mockUpdateVisitorContactDetails.toHaveBeenCalledTimes(1)
        })
        .expect('location', REDIRECT_URL)
        .expect(302)
    })

    it('should respond with a 400 if domain object validation fails.', function () {
      mockUpdateContactDetailsResponse.throws(new ValidationError())
      return supertest(app)
        .post(ROUTE)
        .expect(400)
    })

    it('should respond with a 500 if any non-validation error occurs.', function () {
      mockUpdateContactDetailsResponse.throws(new Error())
      return supertest(app)
        .post(ROUTE)
        .expect(500)
    })

    it('should respond with a 500 if promise rejects.', function () {
      mockUpdateVisitorContactDetails.mockRejectedValue()
      return supertest(app)
        .post(ROUTE)
        .expect(500)
    })
  })
})
