/// <reference types="cypress" />
// const config = require('../../../config')
const moment = require('moment')
const expect = require('chai').expect
const TopUpStatusEnum = require('../../../app/constants/top-up-status-enum')

// Variables for creating and deleting a record
const reference = '123459'
let claimId
const expectedTopUpAmount = '99.02'
const expectedTopUpReason = 'This is a test'

describe('Adding a new top up flow', () => {
  before(function () {
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

  it('should add a top up of ' + expectedTopUpAmount + ' with reason: ' + expectedTopUpReason, () => {
    cy.visit('/')
    cy.visit(`/claim/${claimId}`)

    // View-claim
    cy.get('#assign-self').click()
    cy.get('#top-up-toggle').click()
    cy.get('#top-up-amount').type(expectedTopUpAmount)
    cy.get('#top-up-reason').type(expectedTopUpReason)
    cy.get('#add-top-up').click()

    cy.task('getLastTopUpAdded', claimId).then((topUp) => {
      expect(topUp.TopUpAmount, 'TopUp Amount be equal to ' + expectedTopUpAmount).to.equal(expectedTopUpAmount)
      expect(topUp.Reason, 'TopUp Reason be equal to ' + expectedTopUpReason).to.equal(expectedTopUpReason)
      expect(topUp.PaymentStatus, 'TopUp PaymentStatus should be equal to ' + TopUpStatusEnum.PENDING).to.equal(TopUpStatusEnum.PENDING)
    })
  })

  after(function () {
    cy.task('deleteAll', reference)
  })
})
