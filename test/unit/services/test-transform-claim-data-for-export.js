const dateFormatter = require('../../../app/services/date-formatter')
const prisonsEnum = require('../../../app/constants/prisons-enum')
const benefitsEnum = require('../../../app/constants/benefits-enum')
const claimStatusEnum = require('../../../app/constants/claim-status-enum')
const paymentMethodEnum = require('../../../app/constants/payment-method-enum')

let transformClaimDataForExport
let mockGetClaimEscorts
let mockGetClaimChildCounts
let mockGetClaimExpensesForClaims

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
const TEST_CLAIM_DATA_MIXED_CLAIMIDS = [1]

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
const CLAIM_CHILD_COUNT = [{ ClaimId: 1, Count: 1 }]

jest.mock('../../../app/services/data/get-claim-escorts', () => mockGetClaimEscorts)
jest.mock('../../../app/services/data/get-claim-child-counts', () => mockGetClaimChildCounts)

jest.mock(
  '../../../app/services/data/get-claim-expenses-for-claims',
  () => mockGetClaimExpensesForClaims
)

describe('services/transform-claim-data-for-export', function () {
  beforeEach(function () {
    mockGetClaimEscorts = jest.fn().mockResolvedValue(CLAIM_ESCORT)
    mockGetClaimChildCounts = jest.fn().mockResolvedValue(CLAIM_CHILD_COUNT)
    mockGetClaimExpensesForClaims = jest.fn().mockResolvedValue(CLAIM_EXPENSES)

    transformClaimDataForExport = require('../../../app/services/transform-claim-data-for-export')
  })

  it('should contain all of the required fields', function () {
    return transformClaimDataForExport(TEST_CLAIM_DATA_MIXED)
      .then(function (result) {
        const headers = Object.keys(result[0])

        expect(headers).toContain('Name')
        expect(headers).toContain('Prison Name')
        expect(headers).toContain('Prisoner Relationship')
        expect(headers).toContain('Child Count')
        expect(headers).toContain('Has Escort?')
        expect(headers).toContain('Region')
        expect(headers).toContain('Visit Date')
        expect(headers).toContain('Claim Submission Date')
        expect(headers).toContain('Benefit Claimed')
        expect(headers).toContain('Assisted Digital Caseworker')
        expect(headers).toContain('Caseworker')
        expect(headers).toContain('Trusted?')
        expect(headers).toContain('Status')
        expect(headers).toContain('Date Reviewed by Caseworker')
        expect(headers).toContain('Is Advance Claim?')
        expect(headers).toContain('Total amount paid')
        expect(headers).toContain('Payment Method')
        expect(headers).toContain('Rejection Reason')
      })
  })

  it('should call all relevant functions', function () {
    return transformClaimDataForExport(TEST_CLAIM_DATA_MIXED)
      .then(function (result) {
        expect(mockGetClaimEscorts.calledWith(TEST_CLAIM_DATA_MIXED_CLAIMIDS)).toBe(true) //eslint-disable-line
        expect(mockGetClaimExpensesForClaims.calledWith(TEST_CLAIM_DATA_MIXED_CLAIMIDS)).toBe(true) //eslint-disable-line
        expect(mockGetClaimChildCounts.calledWith(TEST_CLAIM_DATA_MIXED_CLAIMIDS)).toBe(true) //eslint-disable-line
      })
  })

  it('should return the correct total amount paid for claims paid entirely by direct bank transfer', function () {
    return transformClaimDataForExport(TEST_CLAIM_DATA_BANK)
      .then(function (result) {
        expect(result[0]['Total amount paid']).toBe(26.5)
      })
  })

  it('should return the correct total amount paid for claims paid entirely by manual payments', function () {
    return transformClaimDataForExport(TEST_CLAIM_DATA_MANUAL)
      .then(function (result) {
        expect(result[0]['Total amount paid']).toBe(25.5)
      })
  })

  it('should return the correct total amount paid for claims paid using a combination of direct bank payment and manual payments', function () {
    return transformClaimDataForExport(TEST_CLAIM_DATA_MIXED)
      .then(function (result) {
        expect(result[0]['Total amount paid']).toBe(15)
      })
  })

  it('should return the rejection reason for a rejected claim', function () {
    return transformClaimDataForExport(TEST_CLAIM_DATA_REJECTED)
      .then(function (result) {
        expect(result[0]['Rejection Reason']).toBe(rejectionReason)
      })
  })
})
