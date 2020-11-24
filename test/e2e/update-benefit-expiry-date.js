const config = require('../../config')
const moment = require('moment')
const databaseHelper = require('../helpers/database-setup-for-tests')
const expect = require('chai').expect

// Variables for creating and deleting a record
const reference = '1111111'
let date
let claimId
const expectedDay = '20'
const expectedMonth = '1'
const expectedYear = '2020'
const expectedDateMoment = moment(expectedDay + '-' + expectedMonth + '-' + expectedYear, 'DD-MM-YYYY')

describe('Update benefit expiry date flow', () => {
  before(function () {
    date = moment('20010101').toDate()
    return databaseHelper.insertTestData(reference, date, 'APPROVED', undefined, undefined, 'PROCESSED').then(function (ids) {
      claimId = ids.claimId
    })
      .then(async () => {
      // IF SSO ENABLED LOGIN TO SSO
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

  it('should update the benefit expiry date to 20/1/2020', async () => {
    await browser.url('/')

    await browser.url('/claim/' + claimId)

    // View-claim
    const assignSelf = await $('#assign-self')
    await assignSelf.click()

    const expiryDay = await $('#expiry-day-input')
    const expiryMonth = await $('#expiry-month-input')
    const expiryYear = await $('#expiry-year-input')
    const submitButton = await $('#update-benefit-expiry-date')

    await expiryDay.setValue(expectedDay)
    await expiryMonth.setValue(expectedMonth)
    await expiryYear.setValue(expectedYear)
    await submitButton.click()

    const day = await expiryDay.getValue()
    const month = await expiryMonth.getValue()
    const year = await expiryYear.getValue()

    const unassign = await $('#unassign')
    await unassign.click()

    let benefitExpiryDateOnWebpage = await $('#benefit-expiry-date')
    benefitExpiryDateOnWebpage = await benefitExpiryDateOnWebpage.getText()

    const benefitExpiryDate = await databaseHelper.getBenefitExpiryDate(reference)
    expect(day, 'Benefit Expiry Day should be equal to ' + expiryDay).to.equal(expectedDay)
    expect(month, 'Benefit Expiry Month should be equal to ' + expiryMonth).to.equal(expectedMonth)
    expect(year, 'Benefit Expiry Year should be equal to ' + expectedYear).to.equal(expectedYear)
    expect(moment(benefitExpiryDateOnWebpage, 'DD-MM-YYYY').format('DD-MM-YYYY'), 'Benefit Expiry Date should be equal to ' + expectedDay + '-' + expectedMonth + '-' + expectedYear).to.equal(expectedDateMoment.format('DD-MM-YYYY'))
    expect(moment(benefitExpiryDate.BenefitExpiryDate, 'YYYY-MM-DD').format('YYYY-MM-DD'), 'Benefit Expiry Date should be equal to ' + expectedDay + '-' + expectedMonth + '-' + expectedYear).to.equal(expectedDateMoment.format('YYYY-MM-DD'))
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
