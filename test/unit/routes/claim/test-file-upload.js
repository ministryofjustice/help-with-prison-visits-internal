const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const ValidationError = require('../../../../app/services/errors/validation-error')

describe('routes/claim/file-upload', function () {
  const REFERENCE = 'V123456'
  const ELIGIBILITYID = '1234'
  const CLAIMID = '1'
  const CLAIMDOCUMENTID = '1'
  const BASEROUTE = `/claim/file-upload/${REFERENCE}/${CLAIMID}/`
  const VALIDROUTE = `${BASEROUTE}VISIT_CONFIRMATION?claimDocumentId=${CLAIMDOCUMENTID}&eligibilityId=${ELIGIBILITYID}`

  let authorisation
  let uploadStub
  let fileUploadStub
  let claimDocumentUpdateStub
  let generateCSRFTokenStub
  let app
  let getFileUploadPathStub
  let getUploadFilenameStub
  let getFilenamePrefixStub
  let awsStub

  beforeEach(function () {
    const uploadFilename = '1234.png'
    const filenamePrefix = '/test/path'
    authorisation = { hasRoles: sinon.stub() }
    uploadStub = sinon.stub()
    fileUploadStub = sinon.stub()
    claimDocumentUpdateStub = sinon.stub()
    generateCSRFTokenStub = sinon.stub()
    getFileUploadPathStub = sinon.stub().returns('/tmp/1234.png')
    getUploadFilenameStub = sinon.stub().returns(uploadFilename)
    getFilenamePrefixStub = sinon.stub().returns(filenamePrefix)

    awsStub = function () {
      return {
        upload: sinon.stub().resolves(`${filenamePrefix}${uploadFilename}`)
      }
    }

    const awsHelperStub = {
      AWSHelper: awsStub
    }

    const route = proxyquire('../../../../app/routes/claim/file-upload', {
      '../../services/authorisation': authorisation,
      '../../services/upload': uploadStub,
      '../../services/domain/file-upload': fileUploadStub,
      '../../services/data/update-file-upload-details-for-claim': claimDocumentUpdateStub,
      '../../services/generate-csrf-token': generateCSRFTokenStub,
      './file-upload-path-helper': {
        getFileUploadPath: getFileUploadPathStub,
        getUploadFilename: getUploadFilenameStub,
        getFilenamePrefix: getFilenamePrefixStub
      },
      csurf: function () { return function () { } },
      '../../services/aws-helper': awsHelperStub
    })
    app = routeHelper.buildApp(route)
    route(app)
  })

  describe(`GET ${BASEROUTE}`, function () {
    it('should call the CSRFToken generator', function () {
      return supertest(app)
        .get(VALIDROUTE)
        .expect(function () {
          sinon.assert.calledOnce(generateCSRFTokenStub)
          sinon.assert.calledOnce(authorisation.hasRoles)
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
          sinon.assert.calledOnce(authorisation.hasRoles)
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
      uploadStub.callsArg(2).returns({})
      claimDocumentUpdateStub.resolves()

      return supertest(app)
        .post(VALIDROUTE)
        .expect(function () {
          sinon.assert.calledOnce(uploadStub)
          sinon.assert.calledOnce(fileUploadStub)
          sinon.assert.calledOnce(claimDocumentUpdateStub)
        })
        .expect(302)
    })

    it('should catch a validation error', function () {
      uploadStub.callsArg(2).returns({})
      fileUploadStub.throws(new ValidationError())
      return supertest(app)
        .post(VALIDROUTE)
        .expect(400)
    })

    it('should respond with a 500 if passed invalid document type', function () {
      uploadStub.callsArg(2).returns({})
      return supertest(app)
        .post(`${BASEROUTE}TEST/?claimDocumentId=${CLAIMDOCUMENTID}&eligibilityId=${ELIGIBILITYID}`)
        .expect(500)
    })
  })
})
