var expect = require('chai').expect
const config = require('../../../../knexfile').migrations
const knex = require('knex')(config)
const fileTypeEnum = require('../../../../app/constants/payment-filetype-enum')

const TEST_PATH = 'TEST_PATH'

var getPayoutFiles = require('../../../../app/services/data/get-payout-files')

describe('services/data/get-payout-files', function () {
  before(function () {
    var payoutFiles = []
    var getTestDirectPaymentFile = function (fileType, dateCreated) {
      return {
        FileType: fileType,
        DateCreated: dateCreated,
        Filepath: TEST_PATH,
        IsEnabled: true
      }
    }

    for (var i = 0; i < 12; i++) {
      var descendingDate = new Date(new Date().setDate(new Date().getDate() - i))
      payoutFiles.push(getTestDirectPaymentFile(fileTypeEnum.PAYOUT_FILE, descendingDate))
    }

    return knex('DirectPaymentFile').insert(payoutFiles)
  })

  it('should return list of last eleven PAYOUT_FILES', function () {
    return getPayoutFiles()
      .then(function (result) {
        expect(result.length).to.equal(11)
      })
      .catch(function (error) {
        throw error
      })
  })

  after(function () {
    return knex('DirectPaymentFile').where('Filepath', TEST_PATH).del()
  })
})

