const authorisation = require('../services/authorisation')
const getClaimListForAdvancedSearch = require('../services/data/get-claim-list-for-advanced-search')
const exportSearchResults = require('../services/export-search-results')
const displayHelper = require('../views/helpers/display-helper')
const dateFormatter = require('../services/date-formatter')
const validationFieldNames = require('../services/validators/validation-field-names')
const MIN_YEAR = 1900
const VALID_AMOUNT_EXPRESSION = new RegExp(/^(\d+\.?\d{0,9}|\d{1,9})$/)
var validationErrors

module.exports = function (router) {
  router.get('/advanced-search-input', function (req, res) {
    authorisation.isCaseworker(req)

    return res.render('advanced-search')
  })

  router.get('/advanced-search', function (req, res) {
    authorisation.isCaseworker(req)
    validationErrors = {}
    extractSearchCriteria(req.query)

    for (var field in validationErrors) {
      if (validationErrors.hasOwnProperty(field)) {
        if (validationErrors[ field ].length > 0) {
          return res.status(400).render('advanced-search', { query: req.query, errors: validationErrors })
        }
      }
    }

    var queryIndex = req.url.indexOf('?')
    var rawQueryString = queryIndex > -1 ? req.url.substr(queryIndex + 1) : ''

    return res.render('advanced-search', {
      query: req.query,
      rawQuery: rawQueryString
    })
  })

  router.get('/advanced-search-results/export', function (req, res) {
    res.connection.setTimeout(500000)
    authorisation.isCaseworker(req)

    var searchCriteria = extractSearchCriteria(req.query)

    var timestamp = dateFormatter.now().toDate().toISOString()
      .replace('Z', '')
      .replace('T', '_')
      .replace('.', '-')

    var filename = `claims_export_${timestamp}`

    res.set('Content-Type', 'text/csv')
    res.set('Content-Disposition', `attachment; filename="${filename}.csv"`)

    return exportSearchResults(searchCriteria)
      .then(function (csvString) {
        res.write(csvString)
        res.end()
      })
  })

  router.post('/advanced-search-results', function (req, res, next) {
    authorisation.isCaseworker(req)
    var searchCriteria = extractSearchCriteria(req.body)
    getClaimListForAdvancedSearch(searchCriteria, parseInt(req.body.start), parseInt(req.body.length))
      .then(function (data) {
        var claims = data.claims
        claims.map(function (claim) {
          claim.ClaimTypeDisplayName = displayHelper.getClaimTypeDisplayName(claim.ClaimType)
        })

        if (claims.length === 0) {
          return res.json({
            draw: 0,
            recordsTotal: 0,
            recordsFiltered: 0,
            claims: claims
          })
        }

        return res.json({
          draw: req.body.draw,
          recordsTotal: data.total.Count,
          recordsFiltered: data.total.Count,
          claims: claims
        })
      })
      .catch(function (error) {
        next(error)
      })
  })
}

function extractSearchCriteria (query) {
  var searchCriteria = {}

  if (query.reference) {
    searchCriteria.reference = query.reference
  }
  if (query.name) {
    searchCriteria.name = query.name
  }
  if (query.ninumber) {
    searchCriteria.ninumber = query.ninumber
  }
  if (query.prisonerNumber) {
    searchCriteria.prisonerNumber = query.prisonerNumber
  }
  if (query.prison) {
    searchCriteria.prison = query.prison
  }
  if (query.assistedDigital) {
    searchCriteria.assistedDigital = true
  }
  if (query.claimStatus) {
    var claimStatus = null
    switch (query.claimStatus) {
      case 'all':
        claimStatus = 'all'
        break
      case 'new':
        claimStatus = 'NEW'
        break
      case 'pending':
        claimStatus = 'PENDING'
        break
      case 'approved':
        claimStatus = 'APPROVED'
        break
      case 'rejected':
        claimStatus = 'REJECTED'
        break
      case 'inProgress':
        claimStatus = 'inProgress'
        break
      case 'paid':
        claimStatus = 'paid'
        break
    }

    searchCriteria.claimStatus = claimStatus
  }
  if (query.modeOfApproval) {
    searchCriteria.modeOfApproval = query.modeOfApproval === 'auto' ? 'AUTOAPPROVED' : 'APPROVED'
  }
  if (query.pastOrFuture) {
    searchCriteria.pastOrFuture = query.pastOrFuture
  }
  if (query.visitRules) {
    searchCriteria.visitRules = query.visitRules
  }

  if (query.overpaymentStatus) {
    var overpaymentStatus = null
    switch (query.overpaymentStatus) {
      case 'yes':
        overpaymentStatus = 'true'
        break
      case 'no':
        overpaymentStatus = 'false'
        break
    }
    searchCriteria.overpaymentStatus = overpaymentStatus
  }

  var visitDateFrom = processDate(
    'visitDateFrom',
    query.visitDateFromDay,
    query.visitDateFromMonth,
    query.visitDateFromYear
  )
  if (visitDateFrom) {
    searchCriteria.visitDateFrom = visitDateFrom.startOf('day').toDate()
  }
  var visitDateTo = processDate(
    'visitDateTo',
    query.visitDateToDay,
    query.visitDateToMonth,
    query.visitDateToYear
  )
  if (visitDateTo) {
    searchCriteria.visitDateTo = visitDateTo.endOf('day').toDate()
  }
  var dateSubmittedFrom = processDate(
    'dateSubmittedFrom',
    query.dateSubmittedFromDay,
    query.dateSubmittedFromMonth,
    query.dateSubmittedFromYear
  )
  if (dateSubmittedFrom) {
    searchCriteria.dateSubmittedFrom = dateSubmittedFrom.startOf('day').toDate()
  }
  var dateSubmittedTo = processDate(
    'dateSubmittedTo',
    query.dateSubmittedToDay,
    query.dateSubmittedToMonth,
    query.dateSubmittedToYear
  )
  if (dateSubmittedTo) {
    searchCriteria.dateSubmittedTo = dateSubmittedTo.endOf('day').toDate()
  }
  var dateApprovedFrom = processDate(
    'dateApprovedFrom',
    query.dateApprovedFromDay,
    query.dateApprovedFromMonth,
    query.dateApprovedFromYear
  )
  if (dateApprovedFrom) {
    searchCriteria.dateApprovedFrom = dateApprovedFrom.startOf('day').toDate()
  }
  var dateApprovedTo = processDate(
    'dateApprovedTo',
    query.dateApprovedToDay,
    query.dateApprovedToMonth,
    query.dateApprovedToYear
  )
  if (dateApprovedTo) {
    searchCriteria.dateApprovedTo = dateApprovedTo.endOf('day').toDate()
  }
  var dateRejectedFrom = processDate(
    'dateRejectedFrom',
    query.dateRejectedFromDay,
    query.dateRejectedFromMonth,
    query.dateRejectedFromYear
  )
  if (dateRejectedFrom) {
    searchCriteria.dateRejectedFrom = dateRejectedFrom.startOf('day').toDate()
  }
  var dateRejectedTo = processDate(
    'dateRejectedTo',
    query.dateRejectedToDay,
    query.dateRejectedToMonth,
    query.dateRejectedToYear
  )
  if (dateRejectedTo) {
    searchCriteria.dateRejectedTo = dateRejectedTo.endOf('day').toDate()
  }
  if (query.approvedClaimAmountFrom) {
    if (processAmount('approvedClaimAmountFrom', query.approvedClaimAmountFrom)) {
      searchCriteria.approvedClaimAmountFrom = query.approvedClaimAmountFrom
    }
  }
  if (query.approvedClaimAmountTo) {
    if (processAmount('approvedClaimAmountTo', query.approvedClaimAmountTo)) {
      searchCriteria.approvedClaimAmountTo = query.approvedClaimAmountTo
    }
  }

  return searchCriteria
}

function processDate (fieldName, day, month, year) {
  if (day || month || year) {
    var date = dateFormatter.build(day, month, year)
    if (year >= MIN_YEAR && date.isValid()) {
      return date
    } else {
      var validationFieldName = validationFieldNames[fieldName] || 'Date'
      validationErrors[fieldName] = [validationFieldName + ' is invalid']
      return false
    }
  } else {
    return false
  }
}

function processAmount (fieldName, amount) {
  if (amount.match(VALID_AMOUNT_EXPRESSION)) {
    return true
  } else {
    var validationFieldName = validationFieldNames[fieldName] || 'Amount'
    validationErrors[fieldName] = [validationFieldName + ' is invalid']
    return false
  }
}
