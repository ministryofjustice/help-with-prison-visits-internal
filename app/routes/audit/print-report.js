const puppeteer = require('puppeteer')
const fs = require('fs')
const log = require('../../services/log')
const moment = require('moment')
const authorisation = require('../../services/authorisation')
const audit = require('../../constants/audit-enum')
const applicationRoles = require('../../constants/application-roles-enum')
const getReportData = require('../../services/data/audit/get-report-data')
const getReportDates = require('../../services/data/audit/get-report-dates')

module.exports = function (router) {
  router.post('/audit/print-report', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    const reportId = req.body.reportId

    const htmlTemplateContent = fs.readFileSync('./app/template/audit-report.html', 'utf8')

    getReportData(reportId).then(function (claims) {
      getReportDates(reportId).then(function (dates) {
        if (claims) {
          const checkedClaimCount = claims.filter(claim => claim.Band5Validity === audit.CLAIM_STATUS.VALID || claim.Band5Validity === audit.CLAIM_STATUS.INVALID).length
          const validCheckedClaimCount = claims.filter(claim => claim.Band5Validity === audit.CLAIM_STATUS.VALID).length
          const invalidCheckedClaimCount = claims.filter(claim => claim.Band5Validity === audit.CLAIM_STATUS.INVALID).length
          const claimSelectedForVerificationCount = claims.filter(claim => claim.Band9Validity !== audit.STATUS.NOT_REQUIRED).length
          const verifiedClaimCount = claims.filter(claim => claim.Band9Validity === audit.CLAIM_STATUS.VALID || claim.Band9Validity === audit.CLAIM_STATUS.INVALID).length
          const validVerifiedClaimCount = claims.filter(claim => claim.Band9Validity === audit.CLAIM_STATUS.VALID).length
          const invalidVerifiedClaim = claims.filter(claim => claim.Band9Validity === audit.CLAIM_STATUS.INVALID)
          const invalidVerifiedClaimCount = invalidVerifiedClaim.length

          const invalidConfirmedClaimCount = claims.filter(claim => claim.Band5Validity === audit.CLAIM_STATUS.INVALID && claim.Band9Validity === audit.CLAIM_STATUS.INVALID).length
          const validConfirmedClaimCount = claims.filter(claim => claim.Band5Validity === audit.CLAIM_STATUS.INVALID && claim.Band9Validity === audit.CLAIM_STATUS.VALID).length

          const totalCheckedAmount = claims.reduce((n, {
            PaymentAmount
          }) => n + PaymentAmount, 0)
          const startDate = moment(dates[0].StartDate).format(audit.DATE_FORMAT)
          const endDate = moment(dates[0].EndDate).format(audit.DATE_FORMAT)

          const reportData = invalidVerifiedClaim.map(res => getTabularData(res)).join('')
          const pdfContent = htmlTemplateContent
            .replace('{startDate}', startDate)
            .replace('{endDate}', endDate)
            .replace('{reportData}', reportData)
            .replace('{userName}', `${req.user.first_name} ${req.user.last_name}`)
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
          log.info('Pdf content: ' + pdfContent)
          downloadFile(pdfContent, res)
        } else {
          res.render('audit/view-report', {
            reportDeleted: true
          })
        }
      })
    })
  })
}

function getTabularData (data) {
  return `<tr><td>${data.Reference}</td><td>${data.PaymentAmount}</td><td>${data.Band5Username}</td></tr>`
}

async function downloadFile (pdfContent, res) {
  log.info('downloadFile start 1')
  const browser = await puppeteer.launch()
  log.info('downloadFile start 2')
  const page = await browser.newPage()
  log.info('downloadFile start 3')
  await page.setContent(pdfContent)
  log.info('downloadFile start 4')
  await page.pdf({ path: 'example.pdf', format: 'A4' })
  log.info('downloadFile start 5')
  await browser.close()
  log.info('downloadFile start 6')
  res.download('example.pdf', 'example.pdf', (err) => {
    if (err) {
      log.info('downloadFile start 7')
      log.error('Error while downloading PDF:', err)
    }
    fs.unlink('example.pdf', (delErr) => {
      if (delErr) {
        log.info('downloadFile start 8')
        log.error(delErr)
      } else {
        log.info('downloadFile start 9')
        log.info('File is deleted.')
      }
    })
  })
  console.log('Here is your PDF!.')
}
