const Promise = require('bluebird')
const generateCsvString = Promise.promisify(require('csv-stringify'))
const getClaimListForAdvancedSearch = require('../services/data/get-claim-list-for-advanced-search')
const transformData = require('../services/transform-claim-data-for-export')

module.exports = function (searchCriteria) {
  return getClaimListForAdvancedSearch(searchCriteria, 0, Number.MAX_SAFE_INTEGER, true)
    .then(function (data) {
      return transformData(data.claims)
    })
    .then(function (transformedData) {
      return generateCsvString(transformedData, {columns: ["Name","Prison Name","Prisoner Relationship","Child Count","Has Escort?","Visit Date","Claim Submission Date","Region","Benefit Claimed","Assisted Digital Caseworker","Caseworker","Trusted?","Status","Date Reviewed by Caseworker","Is Advance Claim?","Total amount paid","Claim Expenses","Payment Method","Expense Type 1","Approved Cost 1","Expense Type 2","Approved Cost 2","Expense Type 3","Approved Cost 3","Expense Type 4","Approved Cost 4","Expense Type 5","Approved Cost 5","Expense Type 6","Approved Cost 6","Expense Type 7","Approved Cost 7","Expense Type 8","Approved Cost 8","Expense Type 9","Approved Cost 9","Expense Type 10","Approved Cost 10","Expense Type 11","Approved Cost 11","Expense Type 12","Approved Cost 12"], header: true})
    })
    .then(function (csvString) {
      return csvString
    })
}
