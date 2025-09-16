const authorisation = require('../services/authorisation')
const getClaimsListAndCount = require('../services/data/get-claim-list-and-count')
const claimStatusEnum = require('../constants/claim-status-enum')
const displayHelper = require('../views/helpers/display-helper')
const applicationRoles = require('../constants/application-roles-enum')
const log = require('../services/log')

const allowedRoles = [
  applicationRoles.CLAIM_ENTRY_BAND_2,
  applicationRoles.CLAIM_PAYMENT_BAND_3,
  applicationRoles.CASEWORK_MANAGER_BAND_5,
  applicationRoles.BAND_9,
]

module.exports = router => {
  router.get('/', (req, res) => {
    authorisation.hasRoles(req, allowedRoles)

    res.render('index', {
      title: 'HwPV index',
      active: req.query?.status,
    })
  })

  router.get('/claims/:status', (req, res) => {
    authorisation.hasRoles(req, allowedRoles)

    let sortType
    let sortOrder

    log.info(JSON.stringify(req.query))
    log.info(req.query?.['order[0][column]'])

    if (req.query?.order) {
      switch (req.query.order[0].column) {
        case '2':
          sortType = 'Claim.DateSubmitted'
          sortOrder = req.query.order[0].dir
          break
        case '3':
          sortType = 'Claim.DateOfJourney'
          sortOrder = req.query.order[0].dir
          break
        case '4':
          sortType = 'Claim.LastUpdated'
          sortOrder = req.query.order[0].dir
          break
        default:
          sortType = 'Claim.DateSubmitted'
          sortOrder = 'asc'
      }
    } else {
      sortType = 'Claim.DateSubmitted'
      sortOrder = 'asc'
    }

    let advanceClaims = false
    let status = req.params?.status
    if (status === 'ADVANCE') {
      advanceClaims = true
      status = [claimStatusEnum.NEW.value]
    } else if (status === 'ADVANCE-APPROVED') {
      advanceClaims = true
      status = [claimStatusEnum.APPROVED.value]
    } else if (status === 'ADVANCE-UPDATED') {
      advanceClaims = true
      status = [claimStatusEnum.UPDATED.value]
    } else if (status === 'PENDING') {
      advanceClaims = false
      status = [
        claimStatusEnum.PENDING.value,
        claimStatusEnum.REQUEST_INFORMATION.value,
        claimStatusEnum.REQUEST_INFO_PAYMENT.value,
      ]
    } else if (status === 'ADVANCE-PENDING-INFORMATION') {
      advanceClaims = true
      status = [
        claimStatusEnum.PENDING.value,
        claimStatusEnum.REQUEST_INFORMATION.value,
        claimStatusEnum.REQUEST_INFO_PAYMENT.value,
      ]
    } else {
      status = [status]
    }

    getClaimsListAndCount(
      status,
      advanceClaims,
      parseInt(req.query?.start, 10),
      parseInt(req.query?.length, 10),
      req.user.email,
      sortType,
      sortOrder,
    )
      .then(data => {
        const { claims } = data
        claims.map(claim => {
          claim.ClaimTypeDisplayName = displayHelper.getClaimTypeDisplayName(claim.ClaimType)
          return claim
        })

        return res.json({
          draw: req.query?.draw,
          recordsTotal: data.total.Count,
          recordsFiltered: data.total.Count,
          claims,
        })
      })
      .catch(error => {
        res.status(500).send(error)
      })
  })

  router.get('/claims/:status/:sortType', (req, res) => {
    authorisation.hasRoles(req, allowedRoles)

    let sortType
    let sortOrder = 'desc'

    if (req.query?.order) {
      switch (req.query.order[0].column) {
        case '2':
          sortType = 'Claim.DateSubmitted'
          sortOrder = req.query.order[0].dir
          break
        case '3':
          sortType = 'Claim.DateOfJourney'
          sortOrder = req.query.order[0].dir
          break
        case '4':
          sortType = 'Claim.LastUpdated'
          sortOrder = req.query.order[0].dir
          break
        default:
          sortType = 'Claim.DateSubmitted'
          sortOrder = 'asc'
      }
    } else if (req.params?.sortType === 'updated') {
      sortType = 'Claim.LastUpdated'
    } else if (req.params?.sortType === 'visit') {
      sortType = 'Claim.DateOfJourney'
    } else {
      sortType = 'Claim.DateSubmitted'
    }

    let advanceClaims = false
    let status = req.params?.status
    if (status === 'ADVANCE') {
      advanceClaims = true
      status = [claimStatusEnum.NEW.value]
    } else if (status === 'ADVANCE-APPROVED') {
      advanceClaims = true
      status = [claimStatusEnum.APPROVED.value]
    } else if (status === 'ADVANCE-UPDATED') {
      advanceClaims = true
      status = [claimStatusEnum.UPDATED.value]
    } else if (status === 'PENDING') {
      advanceClaims = false
      status = [
        claimStatusEnum.PENDING.value,
        claimStatusEnum.REQUEST_INFORMATION.value,
        claimStatusEnum.REQUEST_INFO_PAYMENT.value,
      ]
    } else if (status === 'ADVANCE-PENDING-INFORMATION') {
      advanceClaims = true
      status = [
        claimStatusEnum.PENDING.value,
        claimStatusEnum.REQUEST_INFORMATION.value,
        claimStatusEnum.REQUEST_INFO_PAYMENT.value,
      ]
    } else {
      status = [status]
    }

    getClaimsListAndCount(
      status,
      advanceClaims,
      parseInt(req.query?.start, 10),
      parseInt(req.query?.length, 10),
      req.user.email,
      sortType,
      sortOrder,
    )
      .then(data => {
        const { claims } = data
        claims.map(claim => {
          claim.ClaimTypeDisplayName = displayHelper.getClaimTypeDisplayName(claim.ClaimType)
          return claim
        })

        return res.json({
          draw: req.query?.draw,
          recordsTotal: data.total.Count,
          recordsFiltered: data.total.Count,
          claims,
        })
      })
      .catch(error => {
        res.status(500).send(error)
      })
  })
}
