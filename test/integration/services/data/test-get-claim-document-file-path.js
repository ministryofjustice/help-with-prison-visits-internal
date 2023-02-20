const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll } = require('../../../helpers/database-setup-for-tests')

const getClaimDocumentFilePath = require('../../../../app/services/data/get-claim-document-file-path')
const reference = 'V954638'
let date
let claimDocumentId

describe('services/data/get-claim-document-file-path', function () {
  before(function () {
    date = dateFormatter.now()
    return insertTestData(reference, date.toDate(), 'TESTING')
      .then(function (ids) {
        claimDocumentId = ids.claimDocumentId1
      })
  })

  it('should have expected file path', function () {
    return getClaimDocumentFilePath(claimDocumentId)
      .then(function (result) {
        expect(result.Filepath).to.equal('/example/path/1')
      })
      .catch(function (error) {
        throw error
      })
  })

  after(function () {
    return deleteAll(reference)
  })
})
