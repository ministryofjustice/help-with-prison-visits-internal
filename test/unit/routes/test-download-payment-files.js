const routeHelper = require('../../helpers/routes/route-helper')
const supertest = require('supertest')
const sinon = require('sinon')

let hasRoles
let getDirectPaymentFiles

const FILES = {
  accessPayFiles: [{ FilePath: 'accessPayFile1' }, { PaymentFileId: 1, Filepath: './test/resources/testfile.txt' }],
  adiJournalFiles: [{ FilePath: 'adiJournalFile1' }, { PaymentFileId: 2, Filepath: './test/resources/testfile.txt' }]
}

jest.mock('../services/authorisation', () => ({
  hasRoles
}))

jest.mock('../services/data/get-direct-payment-files', () => getDirectPaymentFiles)
jest.mock('../services/aws-helper', () => awsHelperStub)

describe('routes/download-payment-files', function () {
  let app
  let awsStub
  let awsHelperStub

  beforeEach(function () {
    hasRoles = jest.fn()
    getDirectPaymentFiles = jest.fn()
    awsStub = function () {
      return {
        download: jest.fn().mockResolvedValue()
      }
    }

    awsHelperStub = {
      AWSHelper: awsStub
    }

    const route = require('../../../app/routes/download-payment-files')

    app = routeHelper.buildApp(route)
  })

  describe('GET /download-payment-files', function () {
    it('should respond with a 200', function () {
      getDirectPaymentFiles.mockResolvedValue()
      return supertest(app)
        .get('/download-payment-files')
        .expect(200)
        .expect(function () {
          expect(hasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(getDirectPaymentFiles).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })

    it('should set top and previous access payment files', function () {
      getDirectPaymentFiles.mockResolvedValue(FILES)
      return supertest(app)
        .get('/download-payment-files')
        .expect(200)
        .expect(function (response) {
          expect(response.text).toContain('"topAccessPayFile":{')
          expect(response.text).toContain('"previousAccessPayFiles":[')
        })
    })

    it('should set top and previous adi journal files', function () {
      getDirectPaymentFiles.mockResolvedValue(FILES)
      return supertest(app)
        .get('/download-payment-files')
        .expect(200)
        .expect(function (response) {
          expect(response.text).toContain('"topAdiJournalFile":{')
          expect(response.text).toContain('"previousAdiJournalFiles":[')
        })
    })

    it('should respond with a 500 promise rejects', function () {
      getDirectPaymentFiles.mockRejectedValue()
      return supertest(app)
        .get('/download-payment-files')
        .expect(500)
    })
  })

  describe('GET /download-payment-files/download', function () {
    it('should respond with 200 if valid id entered', function () {
      getDirectPaymentFiles.mockResolvedValue(FILES)

      awsStub = function () {
        return {
          download: jest.fn().mockResolvedValue(FILES.adiJournalFiles[1].Filepath)
        }
      }

      awsHelperStub = {
        AWSHelper: awsStub
      }

      const route = proxyquire('../../../app/routes/download-payment-files', {
        '../services/authorisation': { hasRoles },
        '../services/data/get-direct-payment-files': getDirectPaymentFiles,
        '../services/aws-helper': awsHelperStub
      })

      app = routeHelper.buildApp(route)

      return supertest(app)
        .get('/download-payment-files/download?id=2')
        .expect(200)
        .expect(function (response) {
          expect(response.header['content-length']).toBe('4')
          expect(hasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
          expect(getDirectPaymentFiles).toHaveBeenCalledTimes(1) //eslint-disable-line
        })
    })

    it('should respond with 500 if no path provided', function () {
      return supertest(app)
        .get('/download-payment-files/download')
        .expect(500)
    })
  })
})
