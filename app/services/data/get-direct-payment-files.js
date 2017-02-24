const config = require('../../../config')
const knexConfig = require('../../../knexfile').intweb
const knex = require('knex')(knexConfig)
const Promise = require('bluebird')
const fileTypeEnum = require('../../constants/payment-filetype-enum')

module.exports = function () {
  const NUMBER_OF_PAYMENT_FILES = parseInt(config.PAYMENT_NUMBER_OF_PAYMENT_FILES)
  const ACCESSPAY_FILE = fileTypeEnum.ACCESSPAY_FILE
  const ADI_JOURNAL_FILE = fileTypeEnum.ADI_JOURNAL_FILE

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
