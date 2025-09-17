/// <reference types="cypress" />
// const config = require('../../config')
const moment = require('moment')

// Variables for creating and deleting a record
const reference = '123456'
let claimId

describe('Requesting bank details flow', () => {
  before(() => {
    const date = moment('20010101').toDate()
    cy.task('insertTestData', { reference, date, status: 'APPROVED', visitDate: undefined, increment: undefined }).then(function (ids) {
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

  it('request new bank account details from an approved claim', () => {
    cy.visit('/')

    // Go to approved claim and request new bank details
    cy.visit('/?status=APPROVED')
    cy.get(`#claim${claimId}`).click()

    cy.get('#assign-self').click()
    cy.get('#request-new-payment-details-toggle').click()
    cy.get('#payment-details-additional-information').type('TESTING')

    cy.get('#request-new-payment-details').click()

    // Check that claim is pending new bank details
    cy.visit('/?status=REQUEST-INFO-PAYMENT')
    cy.get(`#claim${claimId}`).should('not.equal', null)
    cy.get(`#claim${claimId}`).should('not.equal', undefined)
  })

  after(() => {
    cy.task('deleteAll', reference)
  })
})
