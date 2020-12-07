const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const dateFormatter = require('../../../app/services/date-formatter')
const prisonsEnum = require('../../../app/constants/prisons-enum')
const benefitsEnum = require('../../../app/constants/benefits-enum')
const claimStatusEnum = require('../../../app/constants/claim-status-enum')
const paymentMethodEnum = require('../../../app/constants/payment-method-enum')

let transformClaimDataForExport
let getClaimEscortStub
let getClaimChildCountStub
let getClaimExpensesStub

const rejectionReason = 'Applicant is not sole visit/next of kin'

const TEST_CLAIM_DATA_MIXED = [
  {
    ClaimId: 1,
    PaymentAmount: 10.50,
    ManuallyProcessedAmount: 4.50,
    Name: 'Test Claimant',
    NameOfPrison: prisonsEnum.MAGHABERRY.value,
    Relationship: 'partner',
    DateOfJourney: dateFormatter.now().subtract(1, 'days').toDate(),
    DateSubmitted: dateFormatter.now().subtract(2, 'days').toDate(),
    Benefit: benefitsEnum.INCOME_SUPPORT.value,
    AssistedDigitalCaseworker: 'Assisted Digital Caseworker',
    Caseworker: 'Caseworker',
    IsTrusted: true,
    Status: claimStatusEnum.APPROVED.value,
    DateReviewed: dateFormatter.now().subtract(3, 'days').toDate(),
    IsAdvanceClaim: false,
    PaymentMethod: paymentMethodEnum.DIRECT_BANK_PAYMENT.value
  }
]

const TEST_CLAIM_DATA_BANK = [
  {
    ClaimId: 1,
    PaymentAmount: 26.50,
    ManuallyProcessedAmount: null,
    Name: 'Test Claimant',
    NameOfPrison: prisonsEnum.MAGHABERRY.value,
    Relationship: 'partner',
    DateOfJourney: dateFormatter.now().subtract(1, 'days').toDate(),
    DateSubmitted: dateFormatter.now().subtract(2, 'days').toDate(),
    Benefit: benefitsEnum.INCOME_SUPPORT.value,
    AssistedDigitalCaseworker: 'Assisted Digital Caseworker',
    Caseworker: 'Caseworker',
    IsTrusted: true,
    Status: claimStatusEnum.APPROVED.value,
    DateReviewed: dateFormatter.now().subtract(3, 'days').toDate(),
    IsAdvanceClaim: false,
    PaymentMethod: paymentMethodEnum.DIRECT_BANK_PAYMENT.value
  }
]

const TEST_CLAIM_DATA_MANUAL = [
  {
    ClaimId: 1,
    PaymentAmount: null,
    ManuallyProcessedAmount: 25.50,
    Name: 'Test Claimant',
    NameOfPrison: prisonsEnum.MAGHABERRY.value,
    Relationship: 'partner',
    DateOfJourney: dateFormatter.now().subtract(1, 'days').toDate(),
    DateSubmitted: dateFormatter.now().subtract(2, 'days').toDate(),
    Benefit: benefitsEnum.INCOME_SUPPORT.value,
    AssistedDigitalCaseworker: 'Assisted Digital Caseworker',
    Caseworker: 'Caseworker',
    IsTrusted: true,
    Status: claimStatusEnum.APPROVED.value,
    DateReviewed: dateFormatter.now().subtract(3, 'days').toDate(),
    IsAdvanceClaim: false,
    PaymentMethod: paymentMethodEnum.DIRECT_BANK_PAYMENT.value
  }
]

const TEST_CLAIM_DATA_REJECTED = [
  {
    ClaimId: 1,
    PaymentAmount: 0,
    ManuallyProcessedAmount: 0,
    Name: 'Test Claimant',
    NameOfPrison: prisonsEnum.MAGHABERRY.value,
    Relationship: 'partner',
    DateOfJourney: dateFormatter.now().subtract(1, 'days').toDate(),
    DateSubmitted: dateFormatter.now().subtract(2, 'days').toDate(),
    Benefit: benefitsEnum.INCOME_SUPPORT.value,
    AssistedDigitalCaseworker: 'Assisted Digital Caseworker',
    Caseworker: 'Caseworker',
    IsTrusted: true,
    Status: claimStatusEnum.REJECTED.value,
    DateReviewed: dateFormatter.now().subtract(3, 'days').toDate(),
    IsAdvanceClaim: false,
    PaymentMethod: paymentMethodEnum.PAYOUT.value,
    RejectionReason: rejectionReason
  }
]

const CLAIM_EXPENSES = []
const CLAIM_ESCORT = [{}]
const CLAIM_CHILD_COUNT = [{ Count: 1 }]

describe('services/transform-claim-data-for-export', function () {
  beforeEach(function () {
    getClaimEscortStub = sinon.stub().resolves(CLAIM_ESCORT)
    getClaimChildCountStub = sinon.stub().resolves(CLAIM_CHILD_COUNT)
    getClaimExpensesStub = sinon.stub().resolves(CLAIM_EXPENSES)

    transformClaimDataForExport = proxyquire('../../../app/services/transform-claim-data-for-export', {
      '../services/data/get-claim-escort': getClaimEscortStub,
      '../services/data/get-claim-child-count': getClaimChildCountStub,
      '../services/data/get-claim-expenses': getClaimExpensesStub
    })
  })

  it('should contain all of the required fields', function () {
    return transformClaimDataForExport(TEST_CLAIM_DATA_MIXED)
      .then(function (result) {
        const headers = Object.keys(result[0])

        expect(headers).to.contain('Name')
        expect(headers).to.contain('Prison Name')
        expect(headers).to.contain('Prisoner Relationship')
        expect(headers).to.contain('Child Count')
        expect(headers).to.contain('Has Escort?')
        expect(headers).to.contain('Region')
        expect(headers).to.contain('Visit Date')
        expect(headers).to.contain('Claim Submission Date')
        expect(headers).to.contain('Benefit Claimed')
        expect(headers).to.contain('Assisted Digital Caseworker')
        expect(headers).to.contain('Caseworker')
        expect(headers).to.contain('Trusted?')
        expect(headers).to.contain('Status')
        expect(headers).to.contain('Date Reviewed by Caseworker')
        expect(headers).to.contain('Is Advance Claim?')
        expect(headers).to.contain('Total amount paid')
        expect(headers).to.contain('Payment Method')
        expect(headers).to.contain('Rejection Reason')
      })
  })

  it('should call all relevant functions', function () {
    return transformClaimDataForExport(TEST_CLAIM_DATA_MIXED)
      .then(function (result) {
        expect(getClaimEscortStub.calledWith(TEST_CLAIM_DATA_MIXED[0].ClaimId)).to.be.true //eslint-disable-line
        expect(getClaimExpensesStub.calledWith(TEST_CLAIM_DATA_MIXED[0].ClaimId)).to.be.true //eslint-disable-line
        expect(getClaimChildCountStub.calledWith(TEST_CLAIM_DATA_MIXED[0].ClaimId)).to.be.true //eslint-disable-line
      })
  })

  it('should return the correct total amount paid for claims paid entirely by direct bank transfer', function () {
    return transformClaimDataForExport(TEST_CLAIM_DATA_BANK)
      .then(function (result) {
        expect(result[0]['Total amount paid']).to.equal(26.5)
      })
  })

  it('should return the correct total amount paid for claims paid entirely by manual payments', function () {
    return transformClaimDataForExport(TEST_CLAIM_DATA_MANUAL)
      .then(function (result) {
        expect(result[0]['Total amount paid']).to.equal(25.5)
      })
  })

  it('should return the correct total amount paid for claims paid using a combination of direct bank payment and manual payments', function () {
    return transformClaimDataForExport(TEST_CLAIM_DATA_MIXED)
      .then(function (result) {
        expect(result[0]['Total amount paid']).to.equal(15)
      })
  })

  it('should return the rejection reason for a rejected claim', function () {
    return transformClaimDataForExport(TEST_CLAIM_DATA_REJECTED)
      .then(function (result) {
        expect(result[0]['Rejection Reason']).to.equal(rejectionReason)
      })
  })
})
