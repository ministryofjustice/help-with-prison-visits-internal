const supertest = require('supertest')
const express = require('express')
const queryString = require('querystring')
const path = require('path')
const dateFormatter = require('../../../app/services/date-formatter')

const draw = 1
const start = 0
const length = 10

const EXPECTED_DATE_FROM = dateFormatter.build('12', '12', '2016').startOf('day').toDate()
const EXPECTED_DATE_TO = dateFormatter.build('12', '12', '2016').endOf('day').toDate()

const INPUT_SEARCH_CRITERIA = {
  start,
  length,
  reference: 'APVS123',
  name: 'testName',
  ninumber: 'apvs1234',
  prisonerNumber: 'apvs12345',
  prison: 'hewell',
  assistedDigital: 'true',
  claimStatus: 'pending',
  modeOfApproval: 'auto',
  pastOrFuture: 'past',
  visitRules: 'englandWales',
  approvedClaimAmountFrom: '12',
  approvedClaimAmountTo: '12',
  'visitDateFrom-Day': '12',
  'visitDateFrom-Month': '12',
  'visitDateFrom-Year': '2016',
  'visitDateTo-Day': '12',
  'visitDateTo-Month': '12',
  'visitDateTo-Year': '2016',
  'dateSubmittedFrom-Day': '12',
  'dateSubmittedFrom-Month': '12',
  'dateSubmittedFrom-Year': '2016',
  'dateSubmittedTo-Day': '12',
  'dateSubmittedTo-Month': '12',
  'dateSubmittedTo-Year': '2016',
  'dateApprovedFrom-Day': '12',
  'dateApprovedFrom-Month': '12',
  'dateApprovedFrom-Year': '2016',
  'dateApprovedTo-Day': '12',
  'dateApprovedTo-Month': '12',
  'dateApprovedTo-Year': '2016',
  'dateRejectedFrom-Day': '12',
  'dateRejectedFrom-Month': '12',
  'dateRejectedFrom-Year': '2016',
  'dateRejectedTo-Day': '12',
  'dateRejectedTo-Month': '12',
  'dateRejectedTo-Year': '2016',
}

const PROCESSED_SEARCH_CRITERIA = {
  reference: 'APVS123',
  name: 'testName',
  ninumber: 'apvs1234',
  prisonerNumber: 'apvs12345',
  prison: 'hewell',
  pastOrFuture: 'past',
  visitRules: 'englandWales',
  approvedClaimAmountFrom: '12',
  approvedClaimAmountTo: '12',
  assistedDigital: true,
  claimStatus: 'PENDING',
  modeOfApproval: 'AUTOAPPROVED',
  visitDateFrom: EXPECTED_DATE_FROM,
  visitDateTo: EXPECTED_DATE_TO,
  dateSubmittedFrom: EXPECTED_DATE_FROM,
  dateSubmittedTo: EXPECTED_DATE_TO,
  dateApprovedFrom: EXPECTED_DATE_FROM,
  dateApprovedTo: EXPECTED_DATE_TO,
  dateRejectedFrom: EXPECTED_DATE_FROM,
  dateRejectedTo: EXPECTED_DATE_TO,
}

const INVALID_DATE_FIELDS = {
  'visitDateFrom-Day': 'aa',
  'visitDateFrom-Month': '12',
  'visitDateFrom-Year': '2016',
  'visitDateTo-Day': '12',
  'visitDateTo-Month': 'aa',
  'visitDateTo-Year': '2016',
  'dateSubmittedFrom-Day': 'aa',
  'dateSubmittedFrom-Month': 'aa',
  'dateSubmittedFrom-Year': '2016',
  'dateSubmittedTo-Day': '12',
  'dateSubmittedTo-Month': '12',
  'dateSubmittedTo-Year': 'AAAA',
  'dateApprovedFrom-Day': 'aa',
  'dateApprovedFrom-Month': '12',
  'dateApprovedFrom-Year': '2016',
  'dateApprovedTo-Day': '12',
  'dateApprovedTo-Month': 'aa',
  'dateApprovedTo-Year': '2016',
  'dateRejectedFrom-Day': 'aa',
  'dateRejectedFrom-Month': 'aa',
  'dateRejectedFrom-Year': '2016',
  'dateRejectedTo-Day': '12',
  'dateRejectedTo-Month': 'aa',
  'dateRejectedTo-Year': '2016',
}

const INVALID_AMOUNTS = {
  approvedClaimAmountFrom: 'AA',
  approvedClaimAmountTo: 'AA',
}

const EXPECTED_VALIDATION_ERRORS = {
  visitDateFrom: ['Visit date (from) is invalid'],
  visitDateTo: ['Visit date (to) is invalid'],
  dateSubmittedFrom: ['Date submitted (from) is invalid'],
  dateSubmittedTo: ['Date submitted (to) is invalid'],
  dateApprovedFrom: ['Date approved (from) is invalid'],
  dateApprovedTo: ['Date approved (to) is invalid'],
  dateRejectedFrom: ['Date rejected (from) is invalid'],
  dateRejectedTo: ['Date rejected (to) is invalid'],
  approvedClaimAmountFrom: ['Approved claim amount (from) is invalid'],
  approvedClaimAmountTo: ['Approved claim amount (to) is invalid'],
}

const RETURNED_CLAIM = {
  Reference: 'SEARCH1',
  FirstName: 'John',
  LastName: 'Smith',
  DateSubmitted: '2016-11-29T00:00:00.000Z',
  ClaimType: 'first-time',
  ClaimId: 1,
  DateSubmittedFormatted: '28-11-2016 00:00',
  Name: 'John Smith',
}

let errorsReturnedToView = {}
const mockGetClaimListForAdvancedSearch = jest.fn()
let mockDisplayHelper
let mockAuthorisation
const mockHasRoles = jest.fn()
const mockExportSearchResults = jest.fn()
const mockGetClaimTypeDisplayName = jest.fn()

describe('routes/index', () => {
  let app

  beforeEach(() => {
    mockAuthorisation = { hasRoles: mockHasRoles }
    mockDisplayHelper = { getClaimTypeDisplayName: mockGetClaimTypeDisplayName }
    mockDisplayHelper.getClaimTypeDisplayName.mockReturnValue('First time')
    mockExportSearchResults.mockResolvedValue('')

    jest.mock('../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock('../../../app/services/data/get-claim-list-for-advanced-search', () => mockGetClaimListForAdvancedSearch)
    jest.mock('../../../app/views/helpers/display-helper', () => mockDisplayHelper)
    jest.mock('../../../app/services/export-search-results', () => mockExportSearchResults)

    const route = require('../../../app/routes/advanced-search')

    app = express()

    app.engine('html', (filePath, options, callback) => {
      errorsReturnedToView = options.errors
      const rendered = `${filePath}: ${JSON.stringify(options)}`
      return callback(null, rendered)
    })
    app.set('view engine', 'html')
    app.set('views', [path.join(__dirname, '../../../app/views'), path.join(__dirname, '../../../lib/')])
    app.use(express.json())

    route(app)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /advanced-search-input', () => {
    it('should respond with a 200', () => {
      return supertest(app)
        .get('/advanced-search-input')
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
        })
    })
  })

  describe('GET /advanced-search', () => {
    it('should respond with a 200 for no query string', () => {
      return supertest(app)
        .get('/advanced-search')
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 200 with query string', () => {
      return supertest(app)
        .get('/advanced-search?Reference=V123456')
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
        })
    })

    it('should return validation errors for invalid data', () => {
      const searchQueryString = `${queryString.stringify(INVALID_DATE_FIELDS)}&${queryString.stringify(INVALID_AMOUNTS)}`

      return supertest(app)
        .get(`/advanced-search?${searchQueryString}&draw=${draw}&start=${start}&length=${length}`)
        .expect(() => {
          expect(errorsReturnedToView).toEqual(EXPECTED_VALIDATION_ERRORS)
        })
    })
  })

  describe('POST /advanced-search-results', () => {
    it('should respond with a 200 and call data method', () => {
      mockGetClaimListForAdvancedSearch.mockResolvedValue({ claims: [RETURNED_CLAIM], total: { Count: 1 } })
      return supertest(app)
        .post('/advanced-search-results')
        .send({ start, length })
        .expect(200)
        .expect(response => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          // expected data method to be called with empty search criteria
          expect(mockGetClaimListForAdvancedSearch).toHaveBeenCalledWith({}, start, length)
          expect(response.body.recordsTotal).toBe(1)
          expect(response.body.claims[0].ClaimTypeDisplayName).toBe('First time')
        })
    })

    it('should extract search criteria correctly', () => {
      mockGetClaimListForAdvancedSearch.mockResolvedValue({ claims: [RETURNED_CLAIM], total: { Count: 1 } })

      return supertest(app)
        .post('/advanced-search-results')
        .send(INPUT_SEARCH_CRITERIA)
        .expect(response => {
          // expected data method to be called with processed search criteria
          expect(mockGetClaimListForAdvancedSearch).toHaveBeenCalledWith(
            expect.objectContaining(PROCESSED_SEARCH_CRITERIA),
            start,
            length,
          )
        })
    })

    it('should respond with a 500 promise rejects', () => {
      app.use((req, res, next) => {
        next(new Error())
      })
      app.use((err, req, res, next) => {
        if (err) {
          res.status(500).render('includes/error')
        }
      })
      mockGetClaimListForAdvancedSearch.mockRejectedValue()
      return supertest(app).post('/advanced-search-results').expect(500)
    })
  })

  describe('GET /advanced-search-results/export', () => {
    it('should respond with a 200', () => {
      return supertest(app)
        .get('/advanced-search-results/export?')
        .expect(200)
        .expect(() => {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockExportSearchResults).toHaveBeenCalledTimes(1)
        })
    })
  })
})
