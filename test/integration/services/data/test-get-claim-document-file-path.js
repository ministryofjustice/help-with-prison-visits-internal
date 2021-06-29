var expect = require('chai').expect
var dateFormatter = require('../../../../app/services/date-formatter')
var { insertTestData, deleteAll } = require('../../../helpers/database-setup-for-tests')

var getClaimDocumentFilePath = require('../../../../app/services/data/get-claim-document-file-path')
var reference = 'V954638'
var date
var claimDocumentId

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
