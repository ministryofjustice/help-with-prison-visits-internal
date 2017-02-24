const config = require('../../../config')
const knexConfig = require('../../../knexfile').intweb
const knex = require('knex')(knexConfig)
const fileTypeEnum = require('../../constants/payment-filetype-enum')

module.exports = function () {
  const limit = parseInt(config.PAYMENT_NUMBER_OF_PAYOUT_FILES)

  return knex('DirectPaymentFile')
    .select()
    .where({'FileType': fileTypeEnum.PAYOUT_FILE, 'IsEnabled': true})
    .orderBy('DateCreated', 'desc')
    .limit(limit)
}
