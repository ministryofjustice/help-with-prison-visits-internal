const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (reference) {
  return knex('Claim')
    .where({
      'Reference': reference,
      'IsOverpaid': true
    })
}
