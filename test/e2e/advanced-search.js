const knexConfig = require('../../knexfile').migrations
const knex = require('knex')(knexConfig)
const config = require('../../config')

const dateFormatter = require('../../app/services/date-formatter')
const databaseHelper = require('../helpers/database-setup-for-tests')
const moment = require('moment')
const expect = require('chai').expect

const reference1 = '3333333'
const reference2 = '4444444'
let date
let reference1ClaimId
let reference2ClaimId
let yesterday
let tomorrow

describe('Advanced search flow', () => {
  before(function () {
    date = dateFormatter.now()
    yesterday = moment(date).subtract(1, 'day')
    tomorrow = moment(date).add(1, 'day')
    return databaseHelper.insertTestData(reference1, date.toDate(), 'APPROVED')
      .then(function (ids) {
        reference1ClaimId = ids.claimId

        const reference1Update = knex('IntSchema.Claim')
          .update({
            AssistedDigitalCaseworker: 'test@test.com',
            DateOfJourney: date.toDate(),
            DateReviewed: date.toDate(),
            PaymentAmount: '12'
          })
          .where('Reference', reference1)

        const reference2Insert = databaseHelper.insertTestData(reference2, date.toDate(), 'REJECTED', date.toDate(), 10)
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
          const email = await $('#user_email')
          const password = await $('#user_password')
          const commit = await $('[name="commit"]')
          await email.setValue(config.TEST_SSO_EMAIL)
          await password.setValue(config.TEST_SSO_PASSWORD)
          await commit.click()
        }
      })
  })

  it('should display the advanced search page and return existing claims', async () => {
    await browser.url('/')
    let submitButton = await $('#advanced-search')
    await submitButton.click()

    submitButton = await $('#advanced-search-submit')
    let reference = await $('#reference')
    const name = await $('#name')
    const niNumber = await $('#ninumber')
    const prisonerNumber = await $('#prisonerNumber')
    const prison = await $('#prison')
    await reference.setValue('333333')
    await name.setValue('John Smith')
    await niNumber.setValue('QQ123456C')
    await prisonerNumber.setValue('A123456')
    await prison.setValue('Test')

    const assistedDigital = await $('[for="assistedDigital"]')
    const claimStatusApproved = await $('[for="claimStatusApproved"]')
    const modeOfApprovalManual = await $('[for="modeOfApprovalManual"]')
    const typeOfClaimPast = await $('[for="typeOfClaimPast"]')
    const visitRulesEnglandWales = await $('[for="visitRulesEnglandWales"]')

    await assistedDigital.click()
    await claimStatusApproved.click()
    await modeOfApprovalManual.click()
    await typeOfClaimPast.click()
    await visitRulesEnglandWales.click()

    let fromDayInput = await $('#visitDateFromDay')
    let fromMonthInput = await $('#visitDateFromMonth')
    let fromYearInput = await $('#visitDateFromYear')
    let toDayInput = await $('#visitDateToDay')
    let toMonthInput = await $('#visitDateToMonth')
    let toYearInput = await $('#visitDateToYear')
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

    const approvedClaimAmountFromInput = await $('#approvedClaimAmountFromInput')
    const approvedClaimAmountToInput = await $('#approvedClaimAmountToInput')

    await approvedClaimAmountFromInput.setValue(11)
    await approvedClaimAmountToInput.setValue(13)

    await submitButton.click()

    let claimReturned = await $('#claim' + reference1ClaimId)

    expect(claimReturned).to.not.equal(null)
    expect(claimReturned).to.not.equal(undefined)

    const clearSearch = await $('#clear-search')
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
    const deleteReference1 = databaseHelper.deleteAll(reference1)
    const deleteReference2 = databaseHelper.deleteAll(reference2)

    return Promise.all([deleteReference1, deleteReference2])
  })
})
