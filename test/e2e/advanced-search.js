const knexConfig = require('../../knexfile').intweb
const knex = require('knex')(knexConfig)
const config = require('../../config')

var dateFormatter = require('../../app/services/date-formatter')
var databaseHelper = require('../helpers/database-setup-for-tests')
var moment = require('moment')

var reference1 = '3333333'
var reference2 = '4444444'
var date
var reference1ClaimId
var reference2ClaimId
var yesterday
var tomorrow
var promises = []

describe('Advanced search flow', () => {
  before(function () {
    date = dateFormatter.now()
    yesterday = moment(date).subtract(1, 'day')
    tomorrow = moment(date).add(1, 'day')
    if (config.AUTHENTICATION_ENABLED === 'true') {
      promises.push(
        browser.url(config.TOKEN_HOST)
          .waitForExist('#user_email')
          .setValue('#user_email', config.TEST_SSO_EMAIL)
          .setValue('#user_password', config.TEST_SSO_PASSWORD)
          .click('[name="commit"]')
          .waitForExist('[href="/users/sign_out"]')
      )
    }
    promises.push(
      databaseHelper.insertTestData(reference1, date.toDate(), 'APPROVED')
        .then(function (ids) {
          reference1ClaimId = ids.claimId

          var reference1Update = knex('Claim')
            .update({
              'AssistedDigitalCaseworker': 'test@test.com',
              'DateOfJourney': date.toDate(),
              'DateReviewed': date.toDate(),
              'BankPaymentAmount': '12'
            })
            .where('Reference', reference1)

          var reference2Insert = databaseHelper.insertTestData(reference2, date.toDate(), 'REJECTED')
            .then(function (ids) {
              reference2ClaimId = ids.claimId
            })

          return Promise.all([reference1Update, reference2Insert])
            .then(function () {
              return knex('Claim')
                .update({
                  'DateReviewed': date.toDate()
                })
            })
        })
    )
    return Promise.all(promises)
  })

  it('should display the advanced search page and return existing claims', () => {
    return browser.url('/')
      .click('#advanced-search')
      .waitForExist('#advanced-search-submit')

      .setValue('#reference', '333333')
      .setValue('#name', 'John Smith')
      .setValue('#ninumber', 'QQ123456C')
      .setValue('#prisonerNumber', 'A123456')
      .setValue('#prison', 'Test')

      .click('[for="assistedDigital"]')
      .click('[for="claimStatusApproved"]')
      .click('[for="modeOfApprovalManual"]')
      .click('[for="typeOfClaimPast"]')
      .click('[for="visitRulesEnglandScotlandWales"]')

      .setValue('#visitDateFromDay', yesterday.date())
      .setValue('#visitDateFromMonth', yesterday.month() + 1)
      .setValue('#visitDateFromYear', yesterday.year())
      .setValue('#visitDateToDay', tomorrow.date())
      .setValue('#visitDateToMonth', tomorrow.month() + 1)
      .setValue('#visitDateToYear', tomorrow.year())

      .setValue('#dateSubmittedFromDay', yesterday.date())
      .setValue('#dateSubmittedFromMonth', yesterday.month() + 1)
      .setValue('#dateSubmittedFromYear', yesterday.year())
      .setValue('#dateSubmittedToDay', tomorrow.date())
      .setValue('#dateSubmittedToMonth', tomorrow.month() + 1)
      .setValue('#dateSubmittedToYear', tomorrow.year())

      .setValue('#dateApprovedFromDay', yesterday.date())
      .setValue('#dateApprovedFromMonth', yesterday.month() + 1)
      .setValue('#dateApprovedFromYear', yesterday.year())
      .setValue('#dateApprovedToDay', tomorrow.date())
      .setValue('#dateApprovedToMonth', tomorrow.month() + 1)
      .setValue('#dateApprovedToYear', tomorrow.year())

      .setValue('#approvedClaimAmountFromInput', 11)
      .setValue('#approvedClaimAmountToInput', 13)

      .click('#advanced-search-submit')

      .waitForExist('#claim' + reference1ClaimId)

      .click('#clear-search')

      .waitUntil(function () {
        return browser.getText('#reference')
          .then(function (text) {
            return text === ''
          })
      })

      .setValue('#dateRejectedFromDay', yesterday.date())
      .setValue('#dateRejectedFromMonth', yesterday.month() + 1)
      .setValue('#dateRejectedFromYear', yesterday.year())
      .setValue('#dateRejectedToDay', tomorrow.date())
      .setValue('#dateRejectedToMonth', tomorrow.month() + 1)
      .setValue('#dateRejectedToYear', tomorrow.year())

      .click('#advanced-search-submit')

      .waitForExist('#claim' + reference2ClaimId)
  })

  after(function () {
    var deleteReference1 = databaseHelper.deleteAll(reference1)
    var deleteReference2 = databaseHelper.deleteAll(reference2)

    return Promise.all([deleteReference1, deleteReference2])
  })
})
