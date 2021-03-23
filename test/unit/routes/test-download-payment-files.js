const routeHelper = require('../../helpers/routes/route-helper')
const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

let hasRoles
let getDirectPaymentFiles

const FILES = {
  accessPayFiles: [{ FilePath: 'accessPayFile1' }, { PaymentFileId: 1, Filepath: './test/resources/testfile.txt' }],
  adiJournalFiles: [{ FilePath: 'adiJournalFile1' }, { PaymentFileId: 2, Filepath: './test/resources/testfile.txt' }]
}

describe('routes/download-payment-files', function () {
  let app

  beforeEach(function () {
    hasRoles = sinon.stub()
    getDirectPaymentFiles = sinon.stub()

    const route = proxyquire('../../../app/routes/download-payment-files', {
      '../services/authorisation': { hasRoles: hasRoles },
      '../services/data/get-direct-payment-files': getDirectPaymentFiles
    })

    app = routeHelper.buildApp(route)
  })

  describe('GET /download-payment-files', function () {
    it('should respond with a 200', function () {
      getDirectPaymentFiles.resolves()
      return supertest(app)
        .get('/download-payment-files')
        .expect(200)
        .expect(function () {
          expect(hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(getDirectPaymentFiles.calledOnce).to.be.true //eslint-disable-line
        })
    })

    it('should set top and previous access payment files', function () {
      getDirectPaymentFiles.resolves(FILES)
      return supertest(app)
        .get('/download-payment-files')
        .expect(200)
        .expect(function (response) {
          expect(response.text).to.contain('"topAccessPayFile":{')
          expect(response.text).to.contain('"previousAccessPayFiles":[')
        })
    })

    it('should set top and previous adi journal files', function () {
      getDirectPaymentFiles.resolves(FILES)
      return supertest(app)
        .get('/download-payment-files')
        .expect(200)
        .expect(function (response) {
          expect(response.text).to.contain('"topAdiJournalFile":{')
          expect(response.text).to.contain('"previousAdiJournalFiles":[')
        })
    })

    it('should respond with a 500 promise rejects', function () {
      getDirectPaymentFiles.rejects()
      return supertest(app)
        .get('/download-payment-files')
        .expect(500)
    })
  })

  describe('GET /download-payment-files/download', function () {
    it('should respond respond with 200 if valid id entered', function () {
      getDirectPaymentFiles.resolves(FILES)
      return supertest(app)
        .get('/download-payment-files/download?id=2')
        .expect(200)
        .expect(function (response) {
          expect(hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(getDirectPaymentFiles.calledOnce).to.be.true //eslint-disable-line
          expect(response.header['content-length']).to.equal('4')
        })
    })

    it('should respond with 500 if no path provided', function () {
      return supertest(app)
        .get('/download-payment-files/download')
        .expect(500)
    })
  })
})
