var expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const config = require('../../../../knexfile').migrations
const knex = require('knex')(config)
var FileUpload = require('../../../../app/services/domain/file-upload')
var databaseHelper = require('../../../helpers/database-setup-for-tests')
var updateClaimDocument = require('../../../../app/services/data/update-file-upload-details-for-claim')

describe('services/data/update-file-upload-details-for-claim', function () {
  var REFERENCE = 'UPDFILE'
  var claimDocumentId
  var date
  var testData
  var testFileUpload

  before(function () {
    testData = databaseHelper.getTestData(REFERENCE, 'Test').ClaimDocument['visit-confirmation']
    date = dateFormatter.now().toDate()
    return databaseHelper.insertTestData(REFERENCE, date, 'Test').then(function (ids) {
      claimDocumentId = ids.claimDocumentId1
      testFileUpload = new FileUpload({ documentStatus: testData.DocumentStatus, path: 'testPath', dateSubmitted: date }, undefined, claimDocumentId, testData.Caseworker)
    })
  })

  it('should update the claim document', function () {
    return updateClaimDocument(claimDocumentId, testFileUpload)
      .then(function () {
        return knex('IntSchema.CLaimDocument')
          .first()
          .where('ClaimDocumentId', '=', claimDocumentId)
      })
      .then(function (claimDocument) {
        expect(claimDocument.Reference).to.equal(REFERENCE)
        expect(claimDocument.DocumentStatus).to.equal(testData.DocumentStatus)
        expect(claimDocument.Filepath).to.equal('testPath')
        expect(claimDocument.Caseworker).to.equal(testData.Caseworker)
      })
  })

  it('should throw an error if passed a non file upload object.', function () {
    return expect(function () {
      updateClaimDocument(claimDocumentId, {})
    }).to.throw(Error)
  })

  after(function () {
    return databaseHelper.deleteAll(REFERENCE)
  })
})
