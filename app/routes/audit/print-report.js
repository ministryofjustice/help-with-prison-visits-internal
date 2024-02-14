const pdf = require('html-pdf')
const fs = require('fs')
const moment = require('moment')
const downloadsFolder = require('downloads-folder')
const authorisation = require('../../services/authorisation')
const applicationRoles = require('../../constants/application-roles-enum')
const getReportData = require('../../services/data/audit/get-report-data')
const getReportDates = require('../../services/data/audit/get-report-dates')

module.exports = function (router) {
  router.post('/audit/print-report', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    const reportId = req.body.reportId

    var htmlTemplateContent = fs.readFileSync('./app/template/audit-report.html', 'utf8')

    getReportData(reportId).then(function (claims) {
      getReportDates(reportId).then(function (dates) {
        if (claims) {
          const checkedClaimCount = claims.filter(claim => claim.Band5Validity == 'Valid' || claim.Band5Validity == 'Invalid').length
          const validCheckedClaimCount = claims.filter(claim => claim.Band5Validity == 'Valid').length
          const invalidCheckedClaimCount = claims.filter(claim => claim.Band5Validity == 'Invalid').length
          const claimSelectedForVerificationCount = claims.filter(claim => claim.Band9Validity != 'Not required').length
          const verifiedClaimCount = claims.filter(claim => claim.Band9Validity == 'Valid' || claim.Band9Validity == 'Invalid').length
          const validVerifiedClaimCount = claims.filter(claim => claim.Band9Validity == 'Valid').length
          const invalidVerifiedClaim = claims.filter(claim => claim.Band9Validity == 'Invalid')
          const invalidVerifiedClaimCount = invalidVerifiedClaim.length

          const invalidConfirmedClaimCount = claims.filter(claim => claim.Band5Validity == 'Invalid' && claim.Band9Validity == 'Invalid').length
          const validConfirmedClaimCount = claims.filter(claim => claim.Band5Validity == 'Invalid' && claim.Band9Validity == 'Valid').length

          const totalCheckedAmount = claims.reduce((n, {
            PaymentAmount
          }) => n + PaymentAmount, 0)
          const startDate = moment(dates[0].StartDate).format('DD MMMM YYYY')
          const endDate = moment(dates[0].EndDate).format('DD MMMM YYYY')

          var reportData = invalidVerifiedClaim.map(res => getTabularData(res)).join('')
          const pdfContent = htmlTemplateContent
            .replace('{startDate}', startDate)
            .replace('{endDate}', endDate)
            .replace('{reportData}', reportData)
            .replace('{userName}', req.user.name)
            .replace('{dateTime}', moment().format('MMMM Do YYYY, h:mm:ss a'))
            .replaceAll('{checkedClaimCount}', checkedClaimCount)
            .replace('{verifiedClaimCount}', verifiedClaimCount)
            .replace('{totalCheckedAmount}', totalCheckedAmount)
            .replace('{validCheckedClaimCount}', validCheckedClaimCount)
            .replaceAll('{invalidCheckedClaimCount}', invalidCheckedClaimCount)
            .replace('{claimSelectedForVerificationCount}', claimSelectedForVerificationCount)
            .replace('{validVerifiedClaimCount}', validVerifiedClaimCount)
            .replace('{invalidVerifiedClaimCount}', invalidVerifiedClaimCount)
            .replace('{invalidConfirmedClaimCount}', invalidConfirmedClaimCount)
            .replace('{validConfirmedClaimCount}', validConfirmedClaimCount)

          const filePath = `${downloadsFolder()}/Report_${reportId}_${startDate}_${endDate}.pdf`

          generatePDFfromHTML(pdfContent, filePath);
          res.render('audit/report-saved', {
            filePath: filePath
          })
        } else {
          res.render('audit/view-report', {
            reportDeleted: true
          })
        }
      });
    });
  })
}

function generatePDFfromHTML(htmlContent, outputPath) {
  pdf.create(htmlContent).toFile(outputPath, (err, res) => {
    if (err) return console.log(err);
    console.log('PDF generated successfully:', res);
  });
}

function getTabularData(data) {
  return `<tr><td>${data.Reference}</td><td>${data.PaymentAmount}</td><td>${data.Band5Username}</td></tr>`
}
