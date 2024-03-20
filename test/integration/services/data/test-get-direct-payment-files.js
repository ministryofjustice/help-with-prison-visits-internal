const { db } = require('../../../helpers/database-setup-for-tests')
const dateFormatter = require('../../../../app/services/date-formatter')

const TEST_PATH = 'TEST_PATH'

const getDirectPaymentFiles = require('../../../../app/services/data/get-direct-payment-files')

describe('services/data/get-direct-payment-files', function () {
  describe('module', function () {
    beforeAll(function () {
      const directPaymentFiles = []
      const getTestDirectPaymentFile = function (fileType, dateCreated) {
        return {
          FileType: fileType,
          DateCreated: dateCreated,
          Filepath: TEST_PATH,
          IsEnabled: true
        }
      }

      for (let i = 0; i < 32; i++) {
        const descendingDate = new Date(dateFormatter.now().toDate().setDate(new Date().getDate() - i))
        directPaymentFiles.push(getTestDirectPaymentFile('ACCESSPAY_FILE', descendingDate))
        directPaymentFiles.push(getTestDirectPaymentFile('ADI_JOURNAL_FILE', descendingDate))
      }

      return db('DirectPaymentFile').insert(directPaymentFiles)
    })

    it('should return list of last 31 ACCESSPAY_FILE and ADI_JOURNAL_FILE records', function () {
      return getDirectPaymentFiles()
        .then(function (result) {
          expect(result.accessPayFiles.length).toBe(31)
          expect(result.adiJournalFiles.length).toBe(31)
        })
        .catch(function (error) {
          throw error
        });
    })

    afterAll(function () {
      return db('DirectPaymentFile').where('Filepath', TEST_PATH).del()
    })
  })
})
