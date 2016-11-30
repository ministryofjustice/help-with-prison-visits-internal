const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const Promise = require('bluebird')

module.exports = function () {
  const NUMBER_OF_PAYMENT_FILES = 7
  const ACCESSPAY_FILE = 'ACCESSPAY_FILE'
  const ADI_JOURNAL_FILE = 'ADI_JOURNAL_FILE'

  return Promise.all([
    getPaymentFiles(ACCESSPAY_FILE, NUMBER_OF_PAYMENT_FILES),
    getPaymentFiles(ADI_JOURNAL_FILE, NUMBER_OF_PAYMENT_FILES)
  ])
  .then(function (results) {
    return {
      accessPayFiles: results[0],
      adiJournalFiles: results[1]
    }
  })
}

function getPaymentFiles (fileType, limit) {
  return knex('DirectPaymentFile')
    .select()
    .where({'FileType': fileType, 'IsEnabled': true})
    .orderBy('DateCreated', 'desc')
    .limit(limit)
}
