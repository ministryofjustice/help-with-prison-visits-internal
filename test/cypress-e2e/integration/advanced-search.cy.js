// const config = require('../../config')

const dateFormatter = require('../../../app/services/date-formatter')
const moment = require('moment')

const reference1 = '3333333'
const reference2 = '4444444'
let date
let reference1ClaimId
let reference2ClaimId
let yesterday
let tomorrow

describe('Advanced search flow', () => {
  before(() => {
    date = dateFormatter.now()
    yesterday = moment(date).subtract(1, 'day')
    tomorrow = moment(date).add(1, 'day')

    cy.task('insertTestDataAndUpdate', {
      reference: reference1,
      date: date.toDate(),
      status: 'APPROVED',
      visitDate: date.toDate(),
      increment: undefined,
      paymentStatus: null,
      dateReviewed: date.toDate(),
      assistedDigitalCaseworker: 'test@test.com',
      paymentAmount: 12
    })
      .then(function (ids) {
        reference1ClaimId = ids.claimId
      })

    cy.task('insertTestDataAndUpdate', {
      reference: reference2,
      date: date.toDate(),
      status: 'REJECTED',
      visitDate: date.toDate(),
      increment: 10,
      paymentStatus: null,
      dateReviewed: date.toDate()
    })
      .then(function (ids) {
        reference2ClaimId = ids.claimId
      })

    // IF SSO ENABLED LOGIN TO SSO
    // if (config.AUTHENTICATION_ENABLED === 'true') {
    //   cy.visit(config.TOKEN_HOST)
    //   cy.get('#user_email').type(config.TEST_SSO_EMAIL)
    //   cy.get('#user_password').type(config.TEST_SSO_PASSWORD)
    //   cy.get('[name="commit"]').click()
    // }
  })

  it('should display the advanced search page and return existing claims', () => {
    cy.visit('/')
    cy.get('#advanced-search').click()

    cy.get('#reference').type('333333')
    cy.get('#name').type('John Smith')
    cy.get('#ninumber').type('QQ123456C')
    cy.get('#prisonerNumber').type('A123456')
    cy.get('#prison').type('Test')

    cy.get('[for="assistedDigital"]').click()
    cy.get('[for="claimStatusApproved"]').click()
    cy.get('[for="modeOfApprovalManual"]').click()
    cy.get('[for="typeOfClaimPast"]').click()
    cy.get('[for="visitRulesEnglandWales"]').click()

    cy.get('#visitDateFrom-Day').type(yesterday.date())
    cy.get('#visitDateFrom-Month').type(yesterday.month() + 1)
    cy.get('#visitDateFrom-Year').type(yesterday.year())
    cy.get('#visitDateTo-Day').type(tomorrow.date())
    cy.get('#visitDateTo-Month').type(tomorrow.month() + 1)
    cy.get('#visitDateTo-Year').type(tomorrow.year())

    cy.get('#dateSubmittedFrom-Day').type(yesterday.date())
    cy.get('#dateSubmittedFrom-Month').type(yesterday.month() + 1)
    cy.get('#dateSubmittedFrom-Year').type(yesterday.year())
    cy.get('#dateSubmittedTo-Day').type(tomorrow.date())
    cy.get('#dateSubmittedTo-Month').type(tomorrow.month() + 1)
    cy.get('#dateSubmittedTo-Year').type(tomorrow.year())

    cy.get('#dateApprovedFrom-Day').type(yesterday.date())
    cy.get('#dateApprovedFrom-Month').type(yesterday.month() + 1)
    cy.get('#dateApprovedFrom-Year').type(yesterday.year())
    cy.get('#dateApprovedTo-Day').type(tomorrow.date())
    cy.get('#dateApprovedTo-Month').type(tomorrow.month() + 1)
    cy.get('#dateApprovedTo-Year').type(tomorrow.year())

    cy.get('#approvedClaimAmountFromInput').type(11)
    cy.get('#approvedClaimAmountToInput').type(13)

    cy.get('#advanced-search-submit').click()

    cy.get(`#claim${reference1ClaimId}`).should('not.equal', null)
    cy.get(`#claim${reference1ClaimId}`).should('not.equal', undefined)

    cy.get('#clear-search').click()

    cy.get('#reference').should('not.equal', '333333')

    cy.get('#dateRejectedFrom-Day').type(yesterday.date())
    cy.get('#dateRejectedFrom-Month').type(yesterday.month() + 1)
    cy.get('#dateRejectedFrom-Year').type(yesterday.year())
    cy.get('#dateRejectedTo-Day').type(tomorrow.date())
    cy.get('#dateRejectedTo-Month').type(tomorrow.month() + 1)
    cy.get('#dateRejectedTo-Year').type(tomorrow.year())

    cy.get('#advanced-search-submit').click()

    cy.get(`#claim${reference2ClaimId}`).should('not.equal', null)
    cy.get(`#claim${reference2ClaimId}`).should('not.equal', undefined)
  })

  after(() => {
    cy.task('deleteAll', reference1)
    cy.task('deleteAll', reference2)
  })
})
