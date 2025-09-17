const util = require('util')
const { stringify } = require('csv-stringify')

const generateCsvString = util.promisify(stringify)
const getClaimListForAdvancedSearch = require('./data/get-claim-list-for-advanced-search')
const transformData = require('./transform-claim-data-for-export')
const getCSVColumnHeaders = require('./get-csv-column-headers')

module.exports = searchCriteria => {
  return getClaimListForAdvancedSearch(searchCriteria, 0, Number.MAX_SAFE_INTEGER, true)
    .then(data => {
      return transformData(data.claims)
    })
    .then(transformedData => {
      let columnHeaders
      if (Object.keys(transformedData).length > 0) {
        columnHeaders = getCSVColumnHeaders(transformedData)
      } else {
        columnHeaders = []
      }
      return generateCsvString(transformedData, { columns: columnHeaders, header: true })
    })
    .then(csvString => csvString)
}
