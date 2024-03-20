const dateFormatter = require('../../../../app/services/date-formatter')
const FileUpload = require('../../../../app/services/domain/file-upload')
const { getTestData, insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')
const updateClaimDocument = require('../../../../app/services/data/update-file-upload-details-for-claim')

describe('services/data/update-file-upload-details-for-claim', function () {
  const REFERENCE = 'UPDFILE'
  let claimDocumentId
  let date
  let testData
  let testFileUpload

  beforeAll(function () {
    testData = getTestData(REFERENCE, 'Test').ClaimDocument['visit-confirmation']
    date = dateFormatter.now().toDate()
    return insertTestData(REFERENCE, date, 'Test').then(function (ids) {
      claimDocumentId = ids.claimDocumentId1
      testFileUpload = new FileUpload({ documentStatus: testData.DocumentStatus, path: 'testPath', dateSubmitted: date }, undefined, claimDocumentId, testData.Caseworker)
    })
  })

  it('should update the claim document', function () {
    return updateClaimDocument(claimDocumentId, testFileUpload)
      .then(function () {
        return db('ClaimDocument')
          .first()
          .where('ClaimDocumentId', '=', claimDocumentId)
      })
      .then(function (claimDocument) {
        expect(claimDocument.Reference).toBe(REFERENCE)
        expect(claimDocument.DocumentStatus).toBe(testData.DocumentStatus)
        expect(claimDocument.Filepath).toBe('testPath')
        expect(claimDocument.Caseworker).toBe(testData.Caseworker)
      });
  })

  it('should throw an error if passed a non file upload object.', function () {
    return expect(function () {
      updateClaimDocument(claimDocumentId, {})
    }).toThrow(Error);
  })

  afterAll(function () {
    return deleteAll(REFERENCE)
  })
})
