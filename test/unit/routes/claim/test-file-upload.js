const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const ValidationError = require('../../../../app/services/errors/validation-error')

describe('routes/claim/file-upload', function () {
  const REFERENCE = 'V123456'
  const ELIGIBILITYID = '1234'
  const CLAIMID = '1'
  const CLAIMDOCUMENTID = '1'
  const BASEROUTE = `/claim/file-upload/${REFERENCE}/${CLAIMID}/`
  const VALIDROUTE = `${BASEROUTE}VISIT_CONFIRMATION?claimDocumentId=${CLAIMDOCUMENTID}&eligibilityId=${ELIGIBILITYID}`

  let mockAuthorisation
  let app
  const mockHasRoles = jest.fn()
  const mockFileUpload = jest.fn()
  const mockClaimDocumentUpdate = jest.fn()
  const mockGenerateCSRFToken = jest.fn()
  const mockUpload = jest.fn()
  const mockGetFileUploadPath = jest.fn()
  const mockGetUploadFilename = jest.fn()
  const mockGetFilenamePrefix = jest.fn()
  const mockUploadStub = jest.fn()
  const mockAws = jest.fn()
  const mockCsurf = jest.fn()
  const mockCsurfResponse = jest.fn()
  const mockCallback = jest.fn()

  beforeEach(function () {
    const uploadFilename = '1234.png'
    const filenamePrefix = '/test/path'
    mockAuthorisation = { hasRoles: mockHasRoles }
    mockGetFileUploadPath.mockReturnValue('/tmp/1234.png')
    mockGetUploadFilename.mockReturnValue(uploadFilename)
    mockGetFilenamePrefix.mockReturnValue(filenamePrefix)
    mockCsurf.mockReturnValue(mockCsurfResponse)

    mockAws.mockReturnValue({
      upload: mockUpload.mockResolvedValue(`${filenamePrefix}${uploadFilename}`)
    })

    const mockAwsHelper = {
      AWSHelper: mockAws
    }

    jest.mock('../../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock('../../../../app/services/upload', () => mockUploadStub)
    jest.mock('../../../../app/services/domain/file-upload', () => mockFileUpload)
    jest.mock(
      '../../../../app/services/data/update-file-upload-details-for-claim',
      () => mockClaimDocumentUpdate
    )
    jest.mock('../../../../app/services/generate-csrf-token', () => mockGenerateCSRFToken)
    jest.mock('../../../../app/routes/claim/file-upload-path-helper', () => ({
      getFileUploadPath: mockGetFileUploadPath,
      getUploadFilename: mockGetUploadFilename,
      getFilenamePrefix: mockGetFilenamePrefix
    }))
    jest.mock('csurf', () => mockCsurf)
    jest.mock('../../../../app/services/aws-helper', () => mockAwsHelper)

    const route = require('../../../../app/routes/claim/file-upload')
    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe(`GET ${BASEROUTE}`, function () {
    it('should call the CSRFToken generator', function () {
      return supertest(app)
        .get(VALIDROUTE)
        .expect(function () {
          expect(mockGenerateCSRFToken).toHaveBeenCalledTimes(1)
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 200 if passed valid document type', function () {
      return supertest(app)
        .get(VALIDROUTE)
        .expect(200)
    })

    it('should call the directory check', function () {
      return supertest(app)
        .get(VALIDROUTE)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 500 if passed invalid document type', function () {
      return supertest(app)
        .get(`${BASEROUTE}TEST/?claimDocumentId=${CLAIMDOCUMENTID}&eligibilityId=${ELIGIBILITYID}`)
        .expect(500)
    })
  })

  describe(`POST ${BASEROUTE}`, function () {
    it('should create a file upload object, insert it to DB and give 302', function () {
      mockCallback.mockResolvedValue({})
      mockUploadStub.mockImplementation((...args) => args[2]())
      mockClaimDocumentUpdate.mockResolvedValue()

      return supertest(app)
        .post(VALIDROUTE)
        .expect(function () {
          expect(mockUpload).toHaveBeenCalledTimes(1)
          expect(mockFileUpload).toHaveBeenCalledTimes(1)
          expect(mockClaimDocumentUpdate).toHaveBeenCalledTimes(1)
        })
        .expect(302)
    })

    it('should catch a validation error', function () {
      mockCallback.mockResolvedValue({})
      mockUploadStub.mockImplementation((...args) => args[2]())
      mockFileUpload.mockImplementation(() => { throw new ValidationError() })
      return supertest(app)
        .post(VALIDROUTE)
        .expect(400)
    })

    it('should respond with a 500 if passed invalid document type', function () {
      mockCallback.mockResolvedValue({})
      mockUploadStub.mockImplementation((...args) => args[2]())
      return supertest(app)
        .post(`${BASEROUTE}TEST/?claimDocumentId=${CLAIMDOCUMENTID}&eligibilityId=${ELIGIBILITYID}`)
        .expect(500)
    })
  })
})
