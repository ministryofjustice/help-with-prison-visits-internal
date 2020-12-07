const FileUpload = require('../../../../app/services/domain/file-upload')
const expect = require('chai').expect
const UploadError = require('../../../../app/services/errors/upload-error')

describe('services/domain/file-upload', function () {
  const VALID_ID = '1'
  const VALID_FILE = { path: 'path' }
  const CASEWORKER = 'test@test.com'
  const UPLOAD_ERROR = new UploadError('File type error')

  it('should construct a domain object given valid input', function () {
    const fileUpload = new FileUpload(
      VALID_FILE,
      undefined,
      VALID_ID,
      CASEWORKER
    )

    expect(fileUpload.path).to.equal(VALID_FILE.path)
    expect(fileUpload.claimDocumentId).to.equal(VALID_ID)
    expect(fileUpload.caseworker).to.equal(CASEWORKER)
    expect(fileUpload.documentStatus).to.equal('uploaded')
  })

  it('should throw an error if passed invalid data', function () {
    expect(function () {
      new FileUpload(
        undefined,
        undefined,
        VALID_ID,
        CASEWORKER
      ).isValid()
    }).to.throw()
  })

  it('should throw an error if passed UploadError', function () {
    expect(function () {
      new FileUpload(
        VALID_FILE,
        UPLOAD_ERROR,
        VALID_ID,
        CASEWORKER
      ).isValid()
    }).to.throw()
  })
})
