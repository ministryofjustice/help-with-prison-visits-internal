const supertest = require('supertest')
const express = require('express')
const queryString = require('querystring')
const dateFormatter = require('../../../app/services/date-formatter')
const path = require('path')

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
  visitDateFromDay: '12',
  visitDateFromMonth: '12',
  visitDateFromYear: '2016',
  visitDateToDay: '12',
  visitDateToMonth: '12',
  visitDateToYear: '2016',
  dateSubmittedFromDay: '12',
  dateSubmittedFromMonth: '12',
  dateSubmittedFromYear: '2016',
  dateSubmittedToDay: '12',
  dateSubmittedToMonth: '12',
  dateSubmittedToYear: '2016',
  dateApprovedFromDay: '12',
  dateApprovedFromMonth: '12',
  dateApprovedFromYear: '2016',
  dateApprovedToDay: '12',
  dateApprovedToMonth: '12',
  dateApprovedToYear: '2016',
  dateRejectedFromDay: '12',
  dateRejectedFromMonth: '12',
  dateRejectedFromYear: '2016',
  dateRejectedToDay: '12',
  dateRejectedToMonth: '12',
  dateRejectedToYear: '2016'
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
  dateRejectedTo: EXPECTED_DATE_TO
}

const INVALID_DATE_FIELDS = {
  visitDateFromDay: 'aa',
  visitDateFromMonth: '12',
  visitDateFromYear: '2016',
  visitDateToDay: '12',
  visitDateToMonth: 'aa',
  visitDateToYear: '2016',
  dateSubmittedFromDay: 'aa',
  dateSubmittedFromMonth: 'aa',
  dateSubmittedFromYear: '2016',
  dateSubmittedToDay: '12',
  dateSubmittedToMonth: '12',
  dateSubmittedToYear: 'AAAA',
  dateApprovedFromDay: 'aa',
  dateApprovedFromMonth: '12',
  dateApprovedFromYear: '2016',
  dateApprovedToDay: '12',
  dateApprovedToMonth: 'aa',
  dateApprovedToYear: '2016',
  dateRejectedFromDay: 'aa',
  dateRejectedFromMonth: 'aa',
  dateRejectedFromYear: '2016',
  dateRejectedToDay: '12',
  dateRejectedToMonth: 'aa',
  dateRejectedToYear: '2016'
}

const INVALID_AMOUNTS = {
  approvedClaimAmountFrom: 'AA',
  approvedClaimAmountTo: 'AA'
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
  approvedClaimAmountTo: ['Approved claim amount (to) is invalid']
}

const RETURNED_CLAIM = {
  Reference: 'SEARCH1',
  FirstName: 'John',
  LastName: 'Smith',
  DateSubmitted: '2016-11-29T00:00:00.000Z',
  ClaimType: 'first-time',
  ClaimId: 1,
  DateSubmittedFormatted: '28-11-2016 00:00',
  Name: 'John Smith'
}

let errorsReturnedToView = {}
const mockGetClaimListForAdvancedSearch = jest.fn()
let mockDisplayHelper
let mockAuthorisation
const mockHasRoles = jest.fn()
const mockExportSearchResults = jest.fn()
const mockGetClaimTypeDisplayName = jest.fn()

describe('routes/index', function () {
  let app

  beforeEach(function () {
    mockAuthorisation = { hasRoles: mockHasRoles }
    mockDisplayHelper = { getClaimTypeDisplayName: mockGetClaimTypeDisplayName }
    mockDisplayHelper.getClaimTypeDisplayName.mockReturnValue('First time')
    mockExportSearchResults.mockResolvedValue('')

    jest.mock('../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock(
      '../../../app/services/data/get-claim-list-for-advanced-search',
      () => mockGetClaimListForAdvancedSearch
    )
    jest.mock('../../../app/views/helpers/display-helper', () => mockDisplayHelper)
    jest.mock('../../../app/services/export-search-results', () => mockExportSearchResults)

    const route = require('../../../app/routes/advanced-search')

    app = express()

    app.engine('html', function (filePath, options, callback) {
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

  describe('GET /advanced-search-input', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/advanced-search-input')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })
  })

  describe('GET /advanced-search', function () {
    it('should respond with a 200 for no query string', function () {
      return supertest(app)
        .get('/advanced-search')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })

    it('should respond with a 200 with query string', function () {
      return supertest(app)
        .get('/advanced-search?Reference=V123456')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })

    it('should return validation errors for invalid data', function () {
      const searchQueryString = `${queryString.stringify(INVALID_DATE_FIELDS)}&${queryString.stringify(INVALID_AMOUNTS)}`

      return supertest(app)
        .get(`/advanced-search?${searchQueryString}&draw=${draw}&start=${start}&length=${length}`)
        .expect(function (response) {
          expect(errorsReturnedToView).toEqual(EXPECTED_VALIDATION_ERRORS)
        })
    })
  })

  describe('POST /advanced-search-results', function () {
    it('should respond with a 200 and call data method', function () {
      mockGetClaimListForAdvancedSearch.mockResolvedValue({ claims: [RETURNED_CLAIM], total: { Count: 1 } })
      return supertest(app)
        .post('/advanced-search-results')
        .send({ start, length })
        .expect(200)
        .expect(function (response) {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          // expected data method to be called with empty search criteria
          expect(mockGetClaimListForAdvancedSearch).toHaveBeenCalledWith({}, start, length) //eslint-disable-line
          expect(response.body.recordsTotal).toBe(1)
          expect(response.body.claims[0].ClaimTypeDisplayName).toBe('First time')
        })
    })

    it('should extract search criteria correctly', function () {
      mockGetClaimListForAdvancedSearch.mockResolvedValue({ claims: [RETURNED_CLAIM], total: { Count: 1 } })

      return supertest(app)
        .post('/advanced-search-results')
        .send(INPUT_SEARCH_CRITERIA)
        .expect(function (response) {
          // expected data method to be called with processed search criteria
          expect(mockGetClaimListForAdvancedSearch).toHaveBeenCalledWith(expect.objectContaining(PROCESSED_SEARCH_CRITERIA), start, length)
        })
    })

    it('should respond with a 500 promise rejects', function () {
      app.use(function (req, res, next) {
        next(new Error())
      })
      app.use(function (err, req, res, next) {
        if (err) {
          res.status(500).render('includes/error')
        }
      })
      mockGetClaimListForAdvancedSearch.mockRejectedValue()
      return supertest(app)
        .post('/advanced-search-results')
        .expect(500)
    })
  })

  describe('GET /advanced-search-results/export', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/advanced-search-results/export?')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(mockExportSearchResults).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })
  })
})
