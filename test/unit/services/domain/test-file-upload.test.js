const FileUpload = require('../../../../app/services/domain/file-upload')
const UploadError = require('../../../../app/services/errors/upload-error')

describe('services/domain/file-upload', () => {
  const VALID_ID = '1'
  const VALID_FILE = { path: 'path' }
  const CASEWORKER = 'test@test.com'
  const UPLOAD_ERROR = new UploadError('File type error')

  it('should construct a domain object given valid input', () => {
    const fileUpload = new FileUpload(VALID_FILE, undefined, VALID_ID, CASEWORKER)

    expect(fileUpload.path).toBe(VALID_FILE.path)
    expect(fileUpload.claimDocumentId).toBe(VALID_ID)
    expect(fileUpload.caseworker).toBe(CASEWORKER)
    expect(fileUpload.documentStatus).toBe('uploaded')
  })

  it('should throw an error if passed invalid data', () => {
    expect(() => {
      new FileUpload(undefined, undefined, VALID_ID, CASEWORKER).isValid()
    }).toThrow()
  })

  it('should throw an error if passed UploadError', () => {
    expect(() => {
      new FileUpload(VALID_FILE, UPLOAD_ERROR, VALID_ID, CASEWORKER).isValid()
    }).toThrow()
  })
})
