const config = require('../../../config')
const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = () => {
  const NUMBER_OF_PAYMENT_FILES = parseInt(config.PAYMENT_NUMBER_OF_PAYMENT_FILES, 10)
  const ACCESSPAY_FILE = 'ACCESSPAY_FILE'
  const APVU_ACCESSPAY_FILE = 'APVU_ACCESSPAY_FILE'
  const ADI_JOURNAL_FILE = 'ADI_JOURNAL_FILE'

  return Promise.all([
    getPaymentFiles(ACCESSPAY_FILE, NUMBER_OF_PAYMENT_FILES),
    getPaymentFiles(ADI_JOURNAL_FILE, NUMBER_OF_PAYMENT_FILES),
    getPaymentFiles(APVU_ACCESSPAY_FILE, NUMBER_OF_PAYMENT_FILES),
  ]).then(results => {
    return {
      accessPayFiles: results[0],
      adiJournalFiles: results[1],
      apvuAccessPayFiles: results[2],
    }
  })
}

function getPaymentFiles(fileType, limit) {
  const db = getDatabaseConnector()

  return db('DirectPaymentFile')
    .select()
    .where({ FileType: fileType, IsEnabled: true })
    .orderBy('DateCreated', 'desc')
    .limit(limit)
}
