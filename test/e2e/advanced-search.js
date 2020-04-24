const knexConfig = require('../../knexfile').migrations
const knex = require('knex')(knexConfig)
const config = require('../../config')

var dateFormatter = require('../../app/services/date-formatter')
var databaseHelper = require('../helpers/database-setup-for-tests')
var moment = require('moment')
var expect = require('chai').expect

var reference1 = '3333333'
var reference2 = '4444444'
var date
var reference1ClaimId
var reference2ClaimId
var yesterday
var tomorrow

describe('Advanced search flow', () => {
  before(function () {
    date = dateFormatter.now()
    yesterday = moment(date).subtract(1, 'day')
    tomorrow = moment(date).add(1, 'day')
    return databaseHelper.insertTestData(reference1, date.toDate(), 'APPROVED')
      .then(function (ids) {
        reference1ClaimId = ids.claimId

        var reference1Update = knex('IntSchema.Claim')
          .update({
            AssistedDigitalCaseworker: 'test@test.com',
            DateOfJourney: date.toDate(),
            DateReviewed: date.toDate(),
            PaymentAmount: '12'
          })
          .where('Reference', reference1)

        var reference2Insert = databaseHelper.insertTestData(reference2, date.toDate(), 'REJECTED', date.toDate(), 10)
          .then(function (ids) {
            reference2ClaimId = ids.claimId
          })

        return Promise.all([reference1Update, reference2Insert])
          .then(function () {
            return knex('IntSchema.Claim')
              .update({
                DateReviewed: date.toDate()
              })
              .where('Reference', reference2)
          })
      })
      .then(async () => {
        if (config.AUTHENTICATION_ENABLED === 'true') {
          await browser.url(config.TOKEN_HOST)
          var email = await $('#user_email')
          var password = await $('#user_password')
          var commit = await $('[name="commit"]')
          await email.setValue(config.TEST_SSO_EMAIL)
          await password.setValue(config.TEST_SSO_PASSWORD)
          await commit.click()
        }
      })
  })

  it('should display the advanced search page and return existing claims', async () => {
    await browser.url('/')
    var submitButton = await $('#advanced-search')
    await submitButton.click()

    submitButton = await $('#advanced-search-submit')
    var reference = await $('#reference')
    var name = await $('#name')
    var niNumber = await $('#ninumber')
    var prisonerNumber = await $('#prisonerNumber')
    var prison = await $('#prison')
    await reference.setValue('333333')
    await name.setValue('John Smith')
    await niNumber.setValue('QQ123456C')
    await prisonerNumber.setValue('A123456')
    await prison.setValue('Test')

    var assistedDigital = await $('[for="assistedDigital"]')
    var claimStatusApproved = await $('[for="claimStatusApproved"]')
    var modeOfApprovalManual = await $('[for="modeOfApprovalManual"]')
    var typeOfClaimPast = await $('[for="typeOfClaimPast"]')
    var visitRulesEnglandWales = await $('[for="visitRulesEnglandWales"]')

    await assistedDigital.click()
    await claimStatusApproved.click()
    await modeOfApprovalManual.click()
    await typeOfClaimPast.click()
    await visitRulesEnglandWales.click()

    var fromDayInput = await $('#visitDateFromDay')
    var fromMonthInput = await $('#visitDateFromMonth')
    var fromYearInput = await $('#visitDateFromYear')
    var toDayInput = await $('#visitDateToDay')
    var toMonthInput = await $('#visitDateToMonth')
    var toYearInput = await $('#visitDateToYear')
    await fromDayInput.setValue(yesterday.date())
    await fromMonthInput.setValue(yesterday.month() + 1)
    await fromYearInput.setValue(yesterday.year())
    await toDayInput.setValue(tomorrow.date())
    await toMonthInput.setValue(tomorrow.month() + 1)
    await toYearInput.setValue(tomorrow.year())

    fromDayInput = await $('#dateSubmittedFromDay')
    fromMonthInput = await $('#dateSubmittedFromMonth')
    fromYearInput = await $('#dateSubmittedFromYear')
    toDayInput = await $('#dateSubmittedToDay')
    toMonthInput = await $('#dateSubmittedToMonth')
    toYearInput = await $('#dateSubmittedToYear')
    await fromDayInput.setValue(yesterday.date())
    await fromMonthInput.setValue(yesterday.month() + 1)
    await fromYearInput.setValue(yesterday.year())
    await toDayInput.setValue(tomorrow.date())
    await toMonthInput.setValue(tomorrow.month() + 1)
    await toYearInput.setValue(tomorrow.year())

    fromDayInput = await $('#dateApprovedFromDay')
    fromMonthInput = await $('#dateApprovedFromMonth')
    fromYearInput = await $('#dateApprovedFromYear')
    toDayInput = await $('#dateApprovedToDay')
    toMonthInput = await $('#dateApprovedToMonth')
    toYearInput = await $('#dateApprovedToYear')
    await fromDayInput.setValue(yesterday.date())
    await fromMonthInput.setValue(yesterday.month() + 1)
    await fromYearInput.setValue(yesterday.year())
    await toDayInput.setValue(tomorrow.date())
    await toMonthInput.setValue(tomorrow.month() + 1)
    await toYearInput.setValue(tomorrow.year())

    var approvedClaimAmountFromInput = await $('#approvedClaimAmountFromInput')
    var approvedClaimAmountToInput = await $('#approvedClaimAmountToInput')

    await approvedClaimAmountFromInput.setValue(11)
    await approvedClaimAmountToInput.setValue(13)

    await submitButton.click()

    var claimReturned = await $('#claim' + reference1ClaimId)

    expect(claimReturned).to.not.equal(null)
    expect(claimReturned).to.not.equal(undefined)

    var clearSearch = await $('#clear-search')
    await clearSearch.click()

    await browser.pause(3000)
    reference = await $('#reference')
    reference = await reference.getText()

    expect(reference).to.be.equal('')

    fromDayInput = await $('#dateRejectedFromDay')
    fromMonthInput = await $('#dateRejectedFromMonth')
    fromYearInput = await $('#dateRejectedFromYear')
    toDayInput = await $('#dateRejectedToDay')
    toMonthInput = await $('#dateRejectedToMonth')
    toYearInput = await $('#dateRejectedToYear')
    await fromDayInput.setValue(yesterday.date())
    await fromMonthInput.setValue(yesterday.month() + 1)
    await fromYearInput.setValue(yesterday.year())
    await toDayInput.setValue(tomorrow.date())
    await toMonthInput.setValue(tomorrow.month() + 1)
    await toYearInput.setValue(tomorrow.year())

    await submitButton.click()

    claimReturned = await $('#claim' + reference2ClaimId)

    expect(claimReturned).to.not.equal(null)
    expect(claimReturned).to.not.equal(undefined)
  })

  after(function () {
    var deleteReference1 = databaseHelper.deleteAll(reference1)
    var deleteReference2 = databaseHelper.deleteAll(reference2)

    return Promise.all([deleteReference1, deleteReference2])
  })
})
