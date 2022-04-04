/// <reference types="cypress" />

const databaseHelper = require('../../helpers/database-setup-for-tests')

// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

module.exports = (on, config) => {
  // configure plugins here

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
     * @param {String} claimId Claim Id
     */
    getLastTopUpAdded (claimId) {
      return databaseHelper.getLastTopUpAdded(claimId)
    },

    /**
     * Finds first claim reference for given Assisted Digital
     * caseworker then deletes all records with that reference
     *
     * @param {String} claimId Claim Id
     */
    deleteAll (claimId) {
      return databaseHelper.deleteAll(claimId)
    }
  })
}
