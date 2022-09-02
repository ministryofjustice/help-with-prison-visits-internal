/// <reference types="cypress" />
const { defineConfig } = require('cypress')
const databaseHelper = require('./test/helpers/database-setup-for-tests')

module.exports = defineConfig({
  fixturesFolder: 'test/cypress-e2e/fixtures',
  screenshotsFolder: 'test/cypress-e2e/screenshots',
  videosFolder: 'test/cypress-e2e/videos',
  viewportWidth: 1200,
  viewportHeight: 1400,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents (on, config) {
      on('task', {

        /**
         * Finds first claim reference for given Assisted Digital
         * caseworker then deletes all records with that reference
         *
         * @param {String} reference email address
         * @param {Date} date email EmailAddress
         * @param {String} status email EmailAddress
         * @param {Date} visitDate email EmailAddress
         * @param {Number} increment email EmailAddress
         * @param {String} paymentStatus email EmailAddress
         */
        insertTestData ({ reference, date, status, visitDate, increment, paymentStatus }) {
          return databaseHelper.insertTestData(reference, date, status, visitDate, increment, paymentStatus)
        },

        /**
         * Finds first claim reference for given Assisted Digital
         * caseworker then deletes all records with that reference
         *
         * @param {String} reference email address
         * @param {Date} date email EmailAddress
         * @param {String} status email EmailAddress
         * @param {Date} visitDate email EmailAddress
         * @param {Number} increment email EmailAddress
         * @param {String} paymentStatus email EmailAddress
         */
        insertTestDataAndUpdate ({ reference, date, status, visitDate, increment, paymentStatus, dateReviewed, assistedDigitalCaseworker, paymentAmount }) {
          return databaseHelper.insertTestData(reference, date, status, visitDate, increment, paymentStatus, dateReviewed, assistedDigitalCaseworker, paymentAmount)
        },

        /**
         * Finds first claim reference for given Assisted Digital
         * caseworker then deletes all records with that reference
         *
         * @param {String} claimId Claim Id
         */
        getLastTopUpAdded (claimId) {
          return databaseHelper.getLastTopUpAdded(claimId)
        },

        /**
         * Finds first claim reference for given Assisted Digital
         * caseworker then deletes all records with that reference
         *
         * @param {String} reference Reference
         */
        deleteAll (reference) {
          return databaseHelper.deleteAll(reference)
        },

        /**
         * Finds first claim reference for given Assisted Digital
         * caseworker then deletes all records with that reference
         *
         * @param {String} reference Reference
         */
        getBenefitExpiryDate (reference) {
          return databaseHelper.getBenefitExpiryDate(reference)
        }
      })
    },
    baseUrl: 'http://localhost:3001',
    specPattern: 'test/cypress-e2e/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'test/cypress-e2e/support/index.js'
  }
})
