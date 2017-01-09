const transform = require('stream-transform')
const stringify = require('csv-stringify')
const getClaimListForSearch = require('../services/data/get-claim-list-for-search')

// const displayHelper = require('../views/helpers/display-helper')
const dateHelper = require('../views/helpers/date-helper')
// const prisonerRelationshipEnum = require('../../app/constants/prisoner-relationships-enum')

const NAME_HEADER = 'Name'
const PRISON_NAME_HEADER = 'Prison Name'
const PRISONER_RELATIONSHIP_HEADER = 'Prisoner Relationship'
const CHILD_COUNT_HEADER = 'Child Count'
const HAS_MEDICAL_ESCORT_HEADER = 'Has Medical Escort?'
const PRISON_REGION_HEADER = 'Region'
const VISIT_DATE_HEADER = 'Visit Date'
const CLAIM_SUBMISSION_DATE_HEADER = 'Claim Submission Date'
const CLAIMED_HEADER = 'Has Claimed'
const ASSISTED_DIGITAL_CASEWORKER_HEADER = 'Assisted Digital Caseworker'
const CASEWORKER_HEADER = 'Caseworker'
const IS_TRUSTED_HEADER = 'Trusted'
const CLAIM_STATUS_HEADER = 'Status'
const DATE_REVIEWED_BY_CASEWORKER_HEADER = 'Date Reviewed by Caseworker'
const IS_ADVANCE_CLAIM_HEADER = 'Is Advance Claim'
const TOTAL_AMOUNT_PAID_HEADER = 'Total amount paid'

var csvString = ''

module.exports = function (searchCriteria) {
  return getClaimListForSearch(searchCriteria, 0, 10000)
    .then(function (data) {
      var transformedData = []
      var stringifier = getStringifier()
      var transformer = getTransformer(data, stringifier, transformedData)

      writeToTransformer(data.claims, transformer)
      generateCsvString(transformedData, stringifier)

      return csvString
    })
}

function getStringifier () {
  var stringifier = stringify({header: true})

  stringifier.on('readable', function () {
    var row
    while (row = stringifier.read()) {
      csvString += row.toString()
    }
  })

  return stringifier
}

function getTransformer (claimData, stringifier, output) {
  var transformer = transform(function (data) {
    var returnValue = {}
    returnValue[NAME_HEADER] = data.Name
    // returnValue[PRISON_NAME_HEADER] = displayHelper.getPrisonDisplayName(data.NameOfPrison)
    // returnValue[PRISONER_RELATIONSHIP_HEADER] = prisonerRelationshipEnum[data.Relationship].displayName
    // returnValue[CHILD_COUNT_HEADER] = getChildCount(),
    // returnValue[HAS_MEDICAL_ESCORT_HEADER] = hasEscort() ? 'Y' : 'N'
    returnValue[VISIT_DATE_HEADER] = dateHelper.shortDate(data.DateOfJourney)
    returnValue[CLAIM_SUBMISSION_DATE_HEADER] = dateHelper.shortDate(data.DateSubmitted)
    // returnValue[PRISON_REGION_HEADER] = displayHelper.getPrisonRegion(data.NameOfPrison)
    // returnValue[CLAIMED_HEADER] = data.PaymentStatus === 'PROCESSED' ? 'Y' : 'N'
    // returnValue[ASSISTED_DIGITAL_CASEWORKER_HEADER] = data.AssistedDigitalCaseworker
    // returnValue[CASEWORKER_HEADER] = data.Caseworker
    // returnValue[IS_TRUSTED_HEADER] = data.IsTrusted ? 'Y' : 'N'
    // returnValue[CLAIM_STATUS_HEADER] = data.Status
    // returnValue[DATE_REVIEWED_BY_CASEWORKER_HEADER] = dateHelper.shortDate(data.DateReviewed)
    // returnValue[IS_ADVANCE_CLAIM_HEADER] = data.IsAdvanceClaim ? 'Y' : 'N'
    // returnValue[TOTAL_AMOUNT_PAID_HEADER] = data.BankPaymentAmount

    return returnValue
  })

  transformer.on('readable', function () {
    var row
    while (row = transformer.read()) {
      output.push(row)
    }
  })

  transformer.on('error', function (err) {
    console.log(err.message)
  })

  transformer.on('finish', function () {
    output.forEach(function (claim) {
      stringifier.write(claim)
    })
    stringifier.end()
  })

  return transformer
}

function writeToTransformer (data, transformer) {
  data.forEach(function (claim) {
    transformer.write(claim)
  })
}

function generateCsvString (data, stringifier) {
  data.forEach(function (claim) {
    stringifier.write(claim)
  })

  stringifier.end()
}
