const routeHelper = require('../../helpers/routes/route-helper')
const supertest = require('supertest')

const FILES = {
  accessPayFiles: [{ FilePath: 'accessPayFile1' }, { PaymentFileId: 1, Filepath: './test/resources/testfile.txt' }],
  adiJournalFiles: [{ FilePath: 'adiJournalFile1' }, { PaymentFileId: 2, Filepath: './test/resources/testfile.txt' }]
}

const mockHasRoles = jest.fn()
const mockGetDirectPaymentFiles = jest.fn()
const mockDownload = jest.fn()
const mockAws = jest.fn()
let mockAuthorisation
let mockAwsHelper

describe('routes/download-payment-files', function () {
  let app

  beforeEach(function () {
    mockAuthorisation = { hasRoles: mockHasRoles }

    mockAws.mockReturnValue({
      download: mockDownload.mockResolvedValue()
    })

    mockAwsHelper = {
      AWSHelper: mockAws
    }

    jest.mock('../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock('../../../app/services/data/get-direct-payment-files', () => mockGetDirectPaymentFiles)
    jest.mock('../../../app/services/aws-helper', () => mockAwsHelper)

    const route = require('../../../app/routes/download-payment-files')

    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /download-payment-files', function () {
    it('should respond with a 200', function () {
      mockGetDirectPaymentFiles.mockResolvedValue()
      return supertest(app)
        .get('/download-payment-files')
        .expect(200)
        .expect(function () {
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetDirectPaymentFiles).toHaveBeenCalledTimes(1)
        })
    })

    it('should set top and previous access payment files', function () {
      mockGetDirectPaymentFiles.mockResolvedValue(FILES)
      return supertest(app)
        .get('/download-payment-files')
        .expect(200)
        .expect(function (response) {
          expect(response.text).toContain('"topAccessPayFile":{')
          expect(response.text).toContain('"previousAccessPayFiles":[')
        })
    })

    it('should set top and previous adi journal files', function () {
      mockGetDirectPaymentFiles.mockResolvedValue(FILES)
      return supertest(app)
        .get('/download-payment-files')
        .expect(200)
        .expect(function (response) {
          expect(response.text).toContain('"topAdiJournalFile":{')
          expect(response.text).toContain('"previousAdiJournalFiles":[')
        })
    })

    it('should respond with a 500 promise rejects', function () {
      mockGetDirectPaymentFiles.mockRejectedValue()
      return supertest(app)
        .get('/download-payment-files')
        .expect(500)
    })
  })

  describe('GET /download-payment-files/download', function () {
    it('should respond with 200 if valid id entered', function () {
      mockGetDirectPaymentFiles.mockResolvedValue(FILES)
      mockAuthorisation = { hasRoles: mockHasRoles }

      mockAws.mockReturnValue({
        download: mockDownload.mockResolvedValue(FILES.adiJournalFiles[1].Filepath)
      })

      mockAwsHelper = {
        AWSHelper: mockAws
      }

      jest.mock('../../../app/services/authorisation', () => mockAuthorisation)
      jest.mock('../../../app/services/data/get-direct-payment-files', () => mockGetDirectPaymentFiles)
      jest.mock('../../../app/services/aws-helper', () => mockAwsHelper)

      const route = require('../../../app/routes/download-payment-files')

      app = routeHelper.buildApp(route)

      return supertest(app)
        .get('/download-payment-files/download?id=2')
        .expect(200)
        .expect(function (response) {
          expect(response.header['content-length']).toBe('4')
          expect(mockHasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetDirectPaymentFiles).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with 500 if no path provided', function () {
      return supertest(app)
        .get('/download-payment-files/download')
        .expect(500)
    })
  })
})
