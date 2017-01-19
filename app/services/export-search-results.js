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
      return generateCsvString(transformedData, {header: true})
    })
    .then(function (csvString) {
      return csvString
    })
}
