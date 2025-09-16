const authorisation = require('../services/authorisation')
const getDashboardData = require('../services/data/dashboard/get-dashboard-data')
const dashboardFilterEnum = require('../constants/dashboard-filter-enum')
const dateFormatter = require('../services/date-formatter')
const applicationRoles = require('../constants/application-roles-enum')

const allowedRoles = [
  applicationRoles.CLAIM_PAYMENT_BAND_3,
  applicationRoles.CASEWORK_MANAGER_BAND_5,
  applicationRoles.BAND_9,
]

module.exports = router => {
  router.get('/dashboard', (req, res) => {
    authorisation.hasRoles(req, allowedRoles)

    const filter = req.query?.filter || dashboardFilterEnum.TODAY

    return getDashboardData(filter).then(dashboardData => {
      res.render('dashboard', {
        pendingCount: dashboardData.pending,
        inProgressCount: dashboardData.inProgress,
        paidCount: dashboardData.paid,
        autoApprovedCount: dashboardData.autoApproved,
        manuallyApprovedCount: dashboardData.manuallyApproved,
        rejectedCount: dashboardData.rejected,
        filterMonths: getFilterMonths(),
        activeFilter: filter,
      })
    })
  })
}

function getFilterMonths() {
  const oneMonthAgo = dateFormatter.now().subtract(1, 'months').format('MMMM')
  const twoMonthsAgo = dateFormatter.now().subtract(2, 'months').format('MMMM')
  const threeMonthsAgo = dateFormatter.now().subtract(3, 'months').format('MMMM')
  const fourMonthsAgo = dateFormatter.now().subtract(4, 'months').format('MMMM')

  return {
    oneMonthAgo,
    twoMonthsAgo,
    threeMonthsAgo,
    fourMonthsAgo,
  }
}
