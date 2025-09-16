/// <reference types="cypress" />
// const config = require('../../config')
const moment = require('moment')
const expect = require('chai').expect

// Variables for creating and deleting a record
const reference = '123458'
let claimId
const expectedDay = '20'
const expectedMonth = '1'
const expectedYear = '2020'
const expectedDateMoment = moment(expectedDay + '-' + expectedMonth + '-' + expectedYear, 'DD-MM-YYYY')

describe('Update benefit expiry date flow', () => {
  before(() => {
    const date = moment('20010101').toDate()
    cy.task('insertTestData', { reference, date, status: 'APPROVED', visitDate: undefined, increment: undefined, paymentStatus: 'PROCESSED' }).then(function (ids) {
      claimId = ids.claimId
    })
    // IF SSO ENABLED LOGIN TO SSO
    // if (config.AUTHENTICATION_ENABLED === 'true') {
    //   cy.visit(config.TOKEN_HOST)
    //   cy.get('#user_email').type(config.TEST_SSO_EMAIL)
    //   cy.get('#user_password').type(config.TEST_SSO_PASSWORD)
    //   cy.get('[name="commit"]').click()
    // }
  })

  it('should update the benefit expiry date to 20/1/2020', () => {
    cy.visit('/?status=APPROVED')

    cy.get(`#claim${claimId}`).click()

    // View-claim
    cy.get('#assign-self').click()

    cy.get('#expiry-day-input').type(expectedDay)
    cy.get('#expiry-month-input').type(expectedMonth)
    cy.get('#expiry-year-input').type(expectedYear)
    cy.get('#update-benefit-expiry-date').click()

    cy.get('#expiry-day-input').should('have.value', expectedDay)
    cy.get('#expiry-month-input').should('have.value', expectedMonth)
    cy.get('#expiry-year-input').should('have.value', expectedYear)

    cy.get('#unassign').click()

    cy.task('getBenefitExpiryDate', reference).then((benefitExpiryDate) => {
      cy.get('#benefit-expiry-date').invoke('text').then((text) => {
        expect(moment(text.trim(), 'DD-MM-YYYY').format('DD-MM-YYYY'), 'Benefit Expiry Date should be equal to ' + expectedDay + '-' + expectedMonth + '-' + expectedYear).to.equal(expectedDateMoment.format('DD-MM-YYYY'))
      })

      expect(moment(benefitExpiryDate.BenefitExpiryDate, 'YYYY-MM-DD').format('YYYY-MM-DD'), 'Benefit Expiry Date should be equal to ' + expectedDay + '-' + expectedMonth + '-' + expectedYear).to.equal(expectedDateMoment.format('YYYY-MM-DD'))
    })
  })

  after(() => {
    cy.task('deleteAll', reference)
  })
})
