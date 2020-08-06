var expect = require('chai').expect
var sinon = require('sinon')
var proxyquire = require('proxyquire')
var dateFormatter = require('../../../../app/services/date-formatter')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var stubOverpaidClaimsData = {}
var stubGetOverpaidClaims = sinon.stub().resolves(stubOverpaidClaimsData)
var getClaim = proxyquire('../../../../app/services/data/get-individual-claim-details', {
  './get-overpaid-claims-by-reference': stubGetOverpaidClaims
})
var reference = 'INDIVCD'
var testData
var date
var claimId

describe('services/data/get-individual-claim-details', function () {
  describe('get', function () {
    before(function () {
      testData = databaseHelper.getTestData(reference, 'Test')
      date = dateFormatter.now().toDate()
      return databaseHelper.insertTestData(reference, date, 'Test').then(function (ids) {
        claimId = ids.claimId
      })
    })

    it('should return a claims details', function () {
      return getClaim(claimId)
        .then(function (result) {
          expect(result.claim.Reference).to.equal(reference)
          expect(result.claim.ClaimType).to.equal('first-time')
          expect(result.claim.IsAdvanceClaim).to.equal(false)
          expect(result.claim.IsOverpaid).to.equal(false)
          expect(result.claim.OverpaymentAmount).to.equal(20)
          expect(result.claim.FirstName).to.equal(testData.Visitor.FirstName)
          expect(result.claim.DateSubmitted.toString()).to.equal(date.toString())
          expect(result.claim.NationalInsuranceNumber).to.equal(testData.Visitor.NationalInsuranceNumber)
          expect(result.claim.HouseNumberAndStreet).to.equal(testData.Visitor.HouseNumberAndStreet)
          expect(result.claim.EmailAddress).to.equal(testData.Visitor.EmailAddress)
          expect(result.claim.PrisonNumber).to.equal(testData.Prisoner.PrisonNumber)
          expect(result.claim.NameOfPrison).to.equal(testData.Prisoner.NameOfPrison)
          expect(result.claimExpenses[0].ExpenseType).to.equal(testData.ClaimExpenses[0].ExpenseType)
          expect(result.claimExpenses[0].DocumentStatus).to.equal(testData.ClaimDocument.expense.DocumentStatus)
          expect(result.claimExpenses[1].Cost).to.equal(testData.ClaimExpenses[1].Cost)
          expect(result.claim.visitConfirmation.DocumentStatus).to.equal(testData.ClaimDocument['visit-confirmation'].DocumentStatus)
          expect(result.claim.benefitDocument[0].DocumentStatus).to.equal(testData.ClaimDocument.benefit.DocumentStatus)
          expect(result.claimChild[0].FirstName).to.equal(testData.ClaimChild[0].FirstName)
          expect(result.claimChild[0].LastName).to.equal(testData.ClaimChild[0].LastName)
          expect(result.claimChild[1].FirstName).to.equal(testData.ClaimChild[1].FirstName)
          expect(result.claimChild[1].LastName).to.equal(testData.ClaimChild[1].LastName)
          expect(result.claimEvents[0].Caseworker).to.equal(testData.ClaimEvent[0].Caseworker)
          expect(result.claimEvents[1].Caseworker).to.equal(testData.ClaimEvent[1].Caseworker)
          expect(result.deductions[0].DeductionType).to.equal(testData.ClaimDeduction.hc3.DeductionType)
          expect(result.deductions[1].DeductionType).to.equal(testData.ClaimDeduction.overpayment.DeductionType)

          expect(stubGetOverpaidClaims.calledWith(reference)).to.be.true //eslint-disable-line
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function () {
      return databaseHelper.deleteAll(reference)
    })
  })
})
