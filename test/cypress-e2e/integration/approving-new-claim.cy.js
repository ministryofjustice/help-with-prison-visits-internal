/// <reference types="cypress" />
// const config = require('../../config')
const moment = require('moment')
const dateFormatter = require('../../../app/services/date-formatter')

// Variables for creating and deleting a record
const reference = '123457'
let claimId
let expenseId1
let expenseId2
const expiryDate = dateFormatter.now().add(14, 'days')

describe('First time claim viewing flow', () => {
  before(function () {
    const date = moment('20010101').toDate()
    cy.task('insertTestData', { reference, date, status: 'New', visitDate: undefined, increment: undefined }).then(function (ids) {
      claimId = ids.claimId
      expenseId1 = ids.expenseId1
      expenseId2 = ids.expenseId2
    })
    // IF SSO ENABLED LOGIN TO SSO
    // if (config.AUTHENTICATION_ENABLED === 'true') {
    //   cy.visit(config.TOKEN_HOST)
    //   cy.get('#user_email').type(config.TEST_SSO_EMAIL)
    //   cy.get('#user_password').type(config.TEST_SSO_PASSWORD)
    //   cy.get('[name="commit"]').click()
    // }
  })

  it('should display a list of claims and approve a claim', () => {
    cy.visit('/')

    // Index
    cy.get(`#claim${claimId}`).click()

    // View-claim
    cy.get('#assign-self').click()

    cy.get('#visitor-name').should('contain', 'John Smith')

    cy.get('#dwp-status').select('Approve')
    cy.get('#expiry-day-input').type(expiryDate.date())
    cy.get('#expiry-month-input').type(expiryDate.month() + 1)
    cy.get('#expiry-year-input').type(expiryDate.year())
    cy.get('#nomis-check').select('Approve')
    cy.get('#visit-confirmation-check').select('Approve')
    cy.get(`#claim-expense-${expenseId1}-status`).select('Approve')
    cy.get(`#claim-expense-${expenseId2}-status`).select('Approve')
    cy.get('[for="approve"]').click()
    cy.get('#approve-submit').click()

    // Search for approved claim
    cy.get('#input-search-query').type('1111111')
    cy.get('#search').click()

    cy.get(`#claim${claimId}`).should('not.equal', null)
    cy.get(`#claim${claimId}`).should('not.equal', undefined)
  })

  after(function () {
    cy.task('deleteAll', reference)
  })
})
