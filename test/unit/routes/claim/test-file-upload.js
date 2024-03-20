const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const csurf = require('csurf')
const ValidationError = require('../../../../app/services/errors/validation-error')

describe('routes/claim/file-upload', function () {
  const REFERENCE = 'V123456'
  const ELIGIBILITYID = '1234'
  const CLAIMID = '1'
  const CLAIMDOCUMENTID = '1'
  const BASEROUTE = `/claim/file-upload/${REFERENCE}/${CLAIMID}/`
  const VALIDROUTE = `${BASEROUTE}VISIT_CONFIRMATION?claimDocumentId=${CLAIMDOCUMENTID}&eligibilityId=${ELIGIBILITYID}`

  let authorisation
  const mockHasRoles = jest.fn()
  const mockFileUpload = jest.fn()
  const mockClaimDocumentUpdate = jest.fn()
  const mockGenerateCSRFToken = jest.fn()
  const mockUpload = jest.fn()
  let app
  const mockGetFileUploadPath = jest.fn()
  const mockGetUploadFilename = jest.fn()
  const mockGetFilenamePrefix = jest.fn()
  const mockUploadStub = jest.fn()
  let awsStub

  beforeEach(function () {
    const uploadFilename = '1234.png'
    const filenamePrefix = '/test/path'
    authorisation = { hasRoles: mockHasRoles }
    mockGetFileUploadPath.mockReturnValue('/tmp/1234.png')
    mockGetUploadFilename.mockReturnValue(uploadFilename)
    mockGetFilenamePrefix.mockReturnValue(filenamePrefix)

    awsStub = function () {
      return {
        upload: mockUpload.mockResolvedValue(`${filenamePrefix}${uploadFilename}`)
      }
    }

    const awsHelperStub = {
      AWSHelper: awsStub
    }

    jest.mock('../../../../app/services/authorisation', () => authorisation)
    jest.mock('../../../../app/services/upload', () => mockUploadStub)
    jest.mock('../../../../app/services/domain/file-upload', () => mockFileUpload)
    jest.mock(
      '../../../../app/services/data/update-file-upload-details-for-claim',
      () => mockClaimDocumentUpdate
    )
    jest.mock('../../../../app/services/generate-csrf-token', () => mockGenerateCSRFToken)
    jest.mock('../../../../app/routes/claims/file-upload-path-helper', () => ({
      getFileUploadPath: mockGetFileUploadPath,
      getUploadFilename: mockGetUploadFilename,
      getFilenamePrefix: mockGetFilenamePrefix
    }))
    jest.mock(csurf, () => function () { return function () { } })
    jest.mock('../../../../app/services/aws-helper', () => awsHelperStub)

    const route = require('../../../../app/routes/claim/file-upload')
    app = routeHelper.buildApp(route)
    route(app)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe(`GET ${BASEROUTE}`, function () {
    it('should call the CSRFToken generator', function () {
      return supertest(app)
        .get(VALIDROUTE)
        .expect(function () {
          mockGenerateCSRFToken.toHaveBeenCalledTimes(1)
          authorisation.hasRoles.toHaveBeenCalledTimes(1)
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
          authorisation.hasRoles.toHaveBeenCalledTimes(1)
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
      mockUploadStub.callsArg(2).mockReturnValue({})
      mockClaimDocumentUpdate.mockResolvedValue()

      return supertest(app)
        .post(VALIDROUTE)
        .expect(function () {
          mockUpload.toHaveBeenCalledTimes(1)
          mockFileUpload.toHaveBeenCalledTimes(1)
          mockClaimDocumentUpdate.toHaveBeenCalledTimes(1)
        })
        .expect(302)
    })

    it('should catch a validation error', function () {
      mockUploadStub.callsArg(2).mockReturnValue({})
      mockFileUpload.throws(new ValidationError())
      return supertest(app)
        .post(VALIDROUTE)
        .expect(400)
    })

    it('should respond with a 500 if passed invalid document type', function () {
      mockUploadStub.callsArg(2).mockReturnValue({})
      return supertest(app)
        .post(`${BASEROUTE}TEST/?claimDocumentId=${CLAIMDOCUMENTID}&eligibilityId=${ELIGIBILITYID}`)
        .expect(500)
    })
  })
})
