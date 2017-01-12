const authorisation = require('../services/authorisation')
const getClaimListForAdvancedSearch = require('../services/data/get-claim-list-for-advanced-search')
const displayHelper = require('../views/helpers/display-helper')

module.exports = function (router) {
  router.get('/advanced-search-input', function (req, res) {
    authorisation.isCaseworker(req)

    return res.render('advanced-search')
  })

  router.get('/advanced-search', function (req, res) {
    authorisation.isCaseworker(req)

    return res.render('advanced-search', { query: req.query })
  })

  router.get('/advanced-search-results', function (req, res) {
    authorisation.isCaseworker(req)
    var searchCriteria = extractSearchCriteria(req.query)

    getClaimListForAdvancedSearch(searchCriteria, parseInt(req.query.start), parseInt(req.query.length))
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
          draw: req.query.draw,
          recordsTotal: data.total.Count,
          recordsFiltered: data.total.Count,
          claims: claims
        })
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

  return searchCriteria
}
