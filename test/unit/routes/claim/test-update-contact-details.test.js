const supertest = require('supertest')
const routeHelper = require('../../../helpers/routes/route-helper')
const ValidationError = require('../../../../app/services/errors/validation-error')

let mockAuthorisation
const mockGetIndividualClaimDetails = jest.fn()
const mockUpdateContactDetailsResponse = jest.fn()
const mockUpdateVisitorContactDetails = jest.fn()
const mockHasRoles = jest.fn()
let app

describe('routes/claim/update-contact-details', () => {
  const CLAIMID = '1'
  const ROUTE = `/claim/${CLAIMID}/update-contact-details`
  const REDIRECT_URL = `/claim/${CLAIMID}`

  beforeEach(() => {
    mockAuthorisation = { hasRoles: mockHasRoles }
    mockGetIndividualClaimDetails.mockResolvedValue({ claim: {} })
    mockUpdateVisitorContactDetails.mockResolvedValue()

    jest.mock('../../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock('../../../../app/services/data/get-individual-claim-details', () => mockGetIndividualClaimDetails)
    jest.mock('../../../../app/services/domain/update-contact-details-response', () => mockUpdateContactDetailsResponse)
    jest.mock('../../../../app/services/data/update-visitor-contact-details', () => mockUpdateVisitorContactDetails)

    const route = require('../../../../app/routes/claim/update-contact-details')
    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe(`GET ${ROUTE}`, () => {
    it('should respond with a 200', () => {
      return supertest(app)
        .get(ROUTE)
        .expect(() => {
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledTimes(1)
        })
        .expect(200)
    })
  })

  describe(`POST ${ROUTE}`, () => {
    it('should respond with a 302 if domain object is built and updates successfully', () => {
      mockUpdateContactDetailsResponse.mockReturnValue({})
      return supertest(app)
        .post(ROUTE)
        .expect(() => {
          expect(mockUpdateContactDetailsResponse).toHaveBeenCalledTimes(1)
          expect(mockUpdateVisitorContactDetails).toHaveBeenCalledTimes(1)
        })
        .expect('location', REDIRECT_URL)
        .expect(302)
    })

    it('should respond with a 400 if domain object validation fails.', () => {
      mockUpdateContactDetailsResponse.mockImplementation(() => {
        throw new ValidationError()
      })
      return supertest(app).post(ROUTE).expect(400)
    })

    it('should respond with a 500 if any non-validation error occurs.', () => {
      mockUpdateContactDetailsResponse.mockImplementation(() => {
        throw new Error()
      })
      return supertest(app).post(ROUTE).expect(500)
    })

    it('should respond with a 500 if promise rejects.', () => {
      mockUpdateVisitorContactDetails.mockRejectedValue()
      return supertest(app).post(ROUTE).expect(500)
    })
  })
})
