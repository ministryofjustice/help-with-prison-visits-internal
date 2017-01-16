const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const express = require('express')
const mockViewEngine = require('./mock-view-engine')
const queryString = require('querystring')
const dateFormatter = require('../../../app/services/date-formatter')
const sinon = require('sinon')
require('sinon-bluebird')

var getClaimListForAdvancedSearch
var displayHelperStub
var authorisation
var isCaseworkerStub

const INPUT_SEARCH_CRITERIA = {
  reference: 'APVS123',
  name: 'testName',
  ninumber: 'apvs1234',
  prisonerNumber: 'apvs12345',
  prison: 'hewell',
  assistedDigital: 'true',
  claimStatus: 'pending',
  modeOfApproval: 'auto',
  pastOrFuture: 'past',
  visitRules: 'englandScotlandWales',
  approvedClaimAmountFrom: '12',
  approvedClaimAmountTo: '12'
}

const INPUT_DATE_FIELDS = {
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

const EXPECTED_DATE_FROM = dateFormatter.build('12', '12', '2016').startOf('day').toDate()
const EXPECTED_DATE_TO = dateFormatter.build('12', '12', '2016').endOf('day').toDate()

describe('routes/index', function () {
  var app

  beforeEach(function () {
    isCaseworkerStub = sinon.stub()
    authorisation = { isCaseworker: isCaseworkerStub }
    getClaimListForAdvancedSearch = sinon.stub()
    displayHelperStub = sinon.stub({ 'getClaimTypeDisplayName': function () {} })
    displayHelperStub.getClaimTypeDisplayName.returns('First time')

    var route = proxyquire('../../../app/routes/advanced-search', {
      '../services/authorisation': authorisation,
      '../services/data/get-claim-list-for-advanced-search': getClaimListForAdvancedSearch,
      '../views/helpers/display-helper': displayHelperStub
    })

    app = express()
    mockViewEngine(app, '../../../app/views')
    route(app)
  })

  describe('GET /advanced-search-input', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/advanced-search-input')
        .expect(200)
        .expect(function () {
          expect(isCaseworkerStub.calledOnce).to.be.true
        })
    })
  })

  describe('GET /advanced-search', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/advanced-search')
        .expect(200)
        .expect(function () {
          expect(isCaseworkerStub.calledOnce).to.be.true
        })
    })
  })

  describe('GET /advanced-search-results', function () {
    var draw = 1
    var start = 0
    var length = 10

    it('should respond with a 200 and call data method', function () {
      getClaimListForAdvancedSearch.resolves({claims: [RETURNED_CLAIM], total: {Count: 1}})
      return supertest(app)
        .get(`/advanced-search-results?&draw=${draw}&start=${start}&length=${length}`)
        .expect(200)
        .expect(function (response) {
          expect(isCaseworkerStub.calledOnce).to.be.true
          expect(response.body.recordsTotal).to.equal(1)
          expect(response.body.claims[0].ClaimTypeDisplayName).to.equal('First time')
        })
    })

    it('should extract search criteria correctly', function () {
      getClaimListForAdvancedSearch.resolves({claims: [RETURNED_CLAIM], total: {Count: 1}})

      var processedSearchCriteria = {}
      for (var prop in INPUT_SEARCH_CRITERIA) {
        processedSearchCriteria[prop] = INPUT_SEARCH_CRITERIA[prop]
      }

      processedSearchCriteria.assistedDigital = true
      processedSearchCriteria.claimStatus = 'PENDING'
      processedSearchCriteria.modeOfApproval = 'AUTOAPPROVED'
      processedSearchCriteria.visitDateFrom = EXPECTED_DATE_FROM
      processedSearchCriteria.visitDateTo = EXPECTED_DATE_TO
      processedSearchCriteria.dateSubmittedFrom = EXPECTED_DATE_FROM
      processedSearchCriteria.dateSubmittedTo = EXPECTED_DATE_TO
      processedSearchCriteria.dateApprovedFrom = EXPECTED_DATE_FROM
      processedSearchCriteria.dateApprovedTo = EXPECTED_DATE_TO
      processedSearchCriteria.dateRejectedFrom = EXPECTED_DATE_FROM
      processedSearchCriteria.dateRejectedTo = EXPECTED_DATE_TO

      var searchQueryString = `${queryString.stringify(INPUT_SEARCH_CRITERIA)}&${queryString.stringify(INPUT_DATE_FIELDS)}`

      return supertest(app)
        .get(`/advanced-search-results?${searchQueryString}&draw=${draw}&start=${start}&length=${length}`)
        .expect(function (response) {
          expect(getClaimListForAdvancedSearch.calledWith(sinon.match(processedSearchCriteria), start, length), 'expected data method to be called with processed search criteria').to.be.true
        })
    })
  })
})
