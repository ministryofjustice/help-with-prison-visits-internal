const pdf = require('html-pdf')
var request = require('request');
const axios = require('axios')
const stream = require('stream');
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

          const filePath = `Audit reports/Report_${reportId}_${startDate}_${endDate}.pdf`
          //          pdf.create(pdfContent).toFile(filePath, (error, resp) => {
          //            if (error) return log.error(error)
          //            log.info('PDF generated successfully')
          //            res.download(filePath, filePath, (err) => {
          //              if (err) {
          //                log.error('Error while downloading PDF:', err)
          //              }
          //              log.info('PDF downloaded successfully')
          //              fs.unlink(filePath, (delErr) => {
          //                if (delErr) {
          //                  log.error(delErr)
          //                } else {
          //                  log.info('File is deleted.')
          //                }
          //              })
          //            })
          //          })
            downloadedFile(pdfContent)
        } else {
          res.render('audit/view-report', {
            reportDeleted: true
          })
        }
      })
    })
  })
}

function downloadFile(data) {
  request.post(
    'http://localhost:3004/generate-pdf',
    pdfContent,
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.setHeader('Content-disposition', 'attachment; filename=' + filePath);
        res.setHeader('Content-type', 'application/pdf');
        res.write(body, 'binary');
        res.end();
      }
    }
  );
}

async function downloadFile1(pdfContent) {
  try {
    const response = await axios.post('http://localhost:3004/generate-pdf', pdfContent, {
      responseType: 'stream'
    });

    const writableStream = new stream.Writable({
      write(chunk, encoding, callback) {
        fs.appendFile('downloadedFile.txt', chunk, callback)
      }
    });

    response.data.pipe(writableStream);

    await new Promise((resolve, reject) => {
      writableStream.on('finish', resolve);
      writableStream.on('error', reject);
    });

    console.log('File conversion completed successfully');
  } catch (error) {
    console.error('Error downloading file:', error.message);
  }
}

function getTabularData(data) {
  return `<tr><td>${data.Reference}</td><td>${data.PaymentAmount}</td><td>${data.Band5Username}</td></tr>`
}