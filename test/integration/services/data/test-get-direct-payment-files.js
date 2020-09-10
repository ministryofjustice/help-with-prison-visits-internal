var expect = require('chai').expect
const config = require('../../../../knexfile').migrations
const knex = require('knex')(config)
const dateFormatter = require('../../../../app/services/date-formatter')

const TEST_PATH = 'TEST_PATH'

var getDirectPaymentFiles = require('../../../../app/services/data/get-direct-payment-files')

describe('services/data/get-direct-payment-files', function () {
  describe('module', function () {
    before(function () {
      var directPaymentFiles = []
      var getTestDirectPaymentFile = function (fileType, dateCreated) {
        return {
          FileType: fileType,
          DateCreated: dateCreated,
          Filepath: TEST_PATH,
          IsEnabled: true
        }
      }

      for (var i = 0; i < 32; i++) {
        var descendingDate = new Date(dateFormatter.now().toDate().setDate(new Date().getDate() - i))
        directPaymentFiles.push(getTestDirectPaymentFile('ACCESSPAY_FILE', descendingDate))
        directPaymentFiles.push(getTestDirectPaymentFile('ADI_JOURNAL_FILE', descendingDate))
      }

      return knex('DirectPaymentFile').insert(directPaymentFiles)
    })

    it('should return list of last 31 ACCESSPAY_FILE and ADI_JOURNAL_FILE records', function () {
      return getDirectPaymentFiles()
        .then(function (result) {
          expect(result.accessPayFiles.length).to.equal(31)
          expect(result.adiJournalFiles.length).to.equal(31)
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function () {
      return knex('DirectPaymentFile').where('Filepath', TEST_PATH).del()
    })
  })
})
