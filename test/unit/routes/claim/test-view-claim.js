const supertest = require('supertest')
const routeHelper = require('../../../helpers/routes/route-helper')

const dateFormatter = require('../../../../app/services/date-formatter')
const ValidationError = require('../../../../app/services/errors/validation-error')
const deductionTypeEnum = require('../../../../app/constants/deduction-type-enum')
const VALID_CLAIMDEDUCTION_DATA = [{ Amount: '20.00' }]
const VALID_CLAIMEXPENSE_DATA = [{ claimExpenseId: '1', approvedCost: '20.00', cost: '20.00', status: 'APPROVED' }]
const VALID_DATA_APPROVE = {
  decision: 'APPROVED',
  claimExpenses: VALID_CLAIMEXPENSE_DATA,
  claimDeductions: VALID_CLAIMDEDUCTION_DATA
}
const VALID_DATA_ADD_DEDUCTION = {
  'add-deduction': 'Submit',
  deductionType: deductionTypeEnum.HC3_DEDUCTION.value,
  deductionAmount: '1'
}
const VALID_DATA_DISABLE_DEDUCTION = {
  'remove-deduction-1': 'Remove'
}
const VALID_DATA_UPDATE_OVERPAYMENT_STATUS = {
  'overpayment-amount': '20',
  'overpayment-reason': 'cos',
  'closed-claim-action': 'OVERPAYMENT'
}
const VALID_DATA_CLOSE_ADVANCE_CLAIM = {
  'closed-claim-action': 'CLOSE-ADVANCE-CLAIM',
  'close-advance-claim-reason': 'close advance claim reason'
}

const VALID_DATA_ADD_TOP_UP = {
  'closed-claim-action': 'TOPUP',
  'top-up-amount': '140.85',
  'top-up-reason': 'Testing top up'
}
const VALID_DATA_PAYOUT_BARCODE_EXPIRED_CLAIM = {
  'payout-barcode-expired': 'PAYOUT-BARCODE-EXPIRED',
  'payout-barcode-expired-additional-information': 'Expiry reason'
}
const VALID_DATA_INSERT_NOTE = {
  'note-information': 'This is a note'
}
const INVALID_DATA_INSERT_NOTE = {
  'note-information': ''
}
const VALID_DATA_REQUEST_BANK_DETAILS = {
  'closed-claim-action': 'REQUEST-NEW-PAYMENT-DETAILS',
  'payment-details-additional-information': ''
}

const VALID_BENEFIT_EXPIRY_DATA = {
  'expiry-day-input': '20',
  'expiry-month-input': '01',
  'expiry-year-input': '2020'
}

const INCOMPLETE_DATA = {
  decision: 'REJECTED',
  reasonRejected: '',
  claimExpense: []
}
const CLAIM_RETURN = { claim: {} }

const CLAIM_DOCUMENT = {
  Filepath: 'test/resources/testfile.txt'
}

let mockAuthorisation
const mockGetIndividualClaimDetails = jest.fn()
const mockSubmitClaimResponse = jest.fn()
const mockClaimDecision = jest.fn()
const mockGetClaimExpenseResponses = jest.fn()
const mockGetClaimLastUpdated = jest.fn()
const mockCheckUserAndLastUpdated = jest.fn()
const mockInsertDeduction = jest.fn()
const mockDisableDeduction = jest.fn()
const mockClaimDeduction = jest.fn()
const mockGetClaimDocumentFilePath = jest.fn()
const mockUpdateClaimOverpaymentStatus = jest.fn()
const mockOverpaymentResponse = jest.fn()
const mockCloseAdvanceClaim = jest.fn()
const mockPayoutBarcodeExpiredClaim = jest.fn()
const mockInsertNote = jest.fn()
const mockMergeClaimExpensesWithSubmittedResponses = jest.fn()
const mockRequestNewBankDetails = jest.fn()
const mockInsertTopUp = jest.fn()
const mockCancelTopUp = jest.fn()
const mockTopupResponse = jest.fn()
const mockUpdateEligibilityTrustedStatus = jest.fn()
const mockUpdateAssignmentOfClaims = jest.fn()
const mockRejectionReasonId = jest.fn()
const mockRejectionReasons = jest.fn()
const mockUpdateVisitorBenefirExpiryDate = jest.fn()
const mockBenefitExpiryDate = jest.fn()
const mockHasRoles = jest.fn()
const mockDownloadClaim = jest.fn()
const mockAwsClaim = jest.fn()

describe('routes/claim/view-claim', function () {
  let app

  beforeEach(function () {
    mockAuthorisation = { hasRoles: mockHasRoles }
    mockGetClaimLastUpdated.mockResolvedValue({})
    mockRejectionReasonId.mockResolvedValue()
    mockRejectionReasons.mockResolvedValue()
    mockInsertTopUp.mockResolvedValue()
    mockCancelTopUp.mockResolvedValue()

    mockAwsClaim.mockReturnValue({
      download: mockDownloadClaim.mockResolvedValue(CLAIM_DOCUMENT.Filepath)
    })

    const mockAwsHelper = {
      AWSHelper: mockAwsClaim
    }

    jest.mock('../../../../app/services/authorisation', () => mockAuthorisation)
    jest.mock(
      '../../../../app/services/data/get-individual-claim-details',
      () => mockGetIndividualClaimDetails
    )
    jest.mock('../../../../app/services/data/submit-claim-response', () => mockSubmitClaimResponse)
    jest.mock('../../../../app/services/domain/claim-decision', () => mockClaimDecision)
    jest.mock(
      '../../../../app/routes/helpers/get-claim-expense-responses',
      () => mockGetClaimExpenseResponses
    )
    jest.mock(
      '../../../../app/services/data/get-claim-last-updated',
      () => mockGetClaimLastUpdated
    )
    jest.mock(
      '../../../../app/services/check-user-and-last-updated',
      () => mockCheckUserAndLastUpdated
    )
    jest.mock('../../../../app/services/data/insert-deduction', () => mockInsertDeduction)
    jest.mock('../../../../app/services/data/disable-deduction', () => mockDisableDeduction)
    jest.mock('../../../../app/services/domain/claim-deduction', () => mockClaimDeduction)
    jest.mock(
      '../../../../app/services/data/get-claim-document-file-path',
      () => mockGetClaimDocumentFilePath
    )
    jest.mock(
      '../../../../app/services/data/update-claim-overpayment-status',
      () => mockUpdateClaimOverpaymentStatus
    )
    jest.mock(
      '../../../../app/services/domain/overpayment-response',
      () => mockOverpaymentResponse
    )
    jest.mock('../../../../app/services/data/close-advance-claim', () => mockCloseAdvanceClaim)
    jest.mock(
      '../../../../app/services/data/payout-barcode-expired-claim',
      () => mockPayoutBarcodeExpiredClaim
    )
    jest.mock('../../../../app/services/data/insert-note', () => mockInsertNote)
    jest.mock(
      '../../../../app/routes/helpers/merge-claim-expenses-with-submitted-responses',
      () => mockMergeClaimExpensesWithSubmittedResponses
    )
    jest.mock(
      '../../../../app/services/data/request-new-bank-details',
      () => mockRequestNewBankDetails
    )
    jest.mock('../../../../app/services/data/insert-top-up', () => mockInsertTopUp)
    jest.mock('../../../../app/services/domain/topup-response', () => mockTopupResponse)
    jest.mock('../../../../app/services/data/cancel-top-up', () => mockCancelTopUp)
    jest.mock(
      '../../../../app/services/data/update-eligibility-trusted-status',
      () => mockUpdateEligibilityTrustedStatus
    )
    jest.mock(
      '../../../../app/services/data/update-assignment-of-claims',
      () => mockUpdateAssignmentOfClaims
    )
    jest.mock('../../../../app/services/data/get-rejection-reasons', () => mockRejectionReasons)
    jest.mock('../../../../app/services/data/get-rejection-reason-id', () => mockRejectionReasonId)
    jest.mock(
      '../../../../app/services/data/update-visitor-benefit-expiry-date',
      () => mockUpdateVisitorBenefirExpiryDate
    )
    jest.mock('../../../../app/services/domain/benefit-expiry-date', () => mockBenefitExpiryDate)
    jest.mock('../../../../app/services/aws-helper', () => mockAwsHelper)

    const route = require('../../../../app/routes/claim/view-claim')
    app = routeHelper.buildApp(route)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /claim/:claimId', function () {
    it('should respond with a 200', function () {
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)

      return supertest(app)
        .get('/claim/123')
        .expect(200)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
        })
    })
  })

  describe('POST /claim/:claimId', function () {
    it('should respond with 302 when valid data entered', function () {
      const newClaimDecision = {}
      const newClaimExpenseResponse = []
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockSubmitClaimResponse.mockResolvedValue()
      mockClaimDecision.mockReturnValue(newClaimDecision)
      mockGetClaimExpenseResponses.mockReturnValue(newClaimExpenseResponse)
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(302)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetClaimExpenseResponses).toHaveBeenCalledTimes(1)
          expect(mockClaimDecision).toHaveBeenCalledTimes(1)
          expect(mockSubmitClaimResponse).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
        })
    })

    it('should respond with a 500 for an unhandled exception', function () {
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockClaimDecision.mockReturnValue()
      mockGetClaimExpenseResponses.mockReturnValue()
      mockSubmitClaimResponse.mockRejectedValue()

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(500)
    })

    it('should call updateEligibilityTrustedStatus if claim decision is APPROVED', function () {
      const newClaimDecision = { decision: 'APPROVED' }
      const newClaimExpenseResponse = []
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockSubmitClaimResponse.mockResolvedValue()
      mockClaimDecision.mockReturnValue(newClaimDecision)
      mockGetClaimExpenseResponses.mockReturnValue(newClaimExpenseResponse)
      mockUpdateEligibilityTrustedStatus.mockResolvedValue()
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(302)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetClaimExpenseResponses).toHaveBeenCalledTimes(1)
          expect(mockClaimDecision).toHaveBeenCalledTimes(1)
          expect(mockSubmitClaimResponse).toHaveBeenCalledTimes(1)
          expect(mockUpdateEligibilityTrustedStatus).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
        })
    })

    it('should respond with 400 when user and user and last updated check throws validation error', function () {
      mockCheckUserAndLastUpdated.mockImplementation(() => { throw new ValidationError({ reason: {} }) })
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(400)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
        })
    })

    it('should respond with 400 when invalid data entered', function () {
      mockClaimDecision.mockImplementation(() => { throw new ValidationError({ reason: {} }) })
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)
      mockCheckUserAndLastUpdated.mockResolvedValue()

      return supertest(app)
        .post('/claim/123')
        .send(INCOMPLETE_DATA)
        .expect(400)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockClaimDecision.mockReturnValue({})
      mockClaimDecision.mockRejectedValue()

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(500)
    })

    it('should populate NomisCheck, DWPCheck and VisitConfirmationCheck when handling error and data is available', function () {
      const claimDetails = {
        claim: {},
        claimExpenses: [{}]
      }

      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockGetClaimExpenseResponses.mockReturnValue([{}])
      mockSubmitClaimResponse.mockImplementation(() => { throw new ValidationError() })
      mockGetIndividualClaimDetails.mockResolvedValue(claimDetails)
      mockMergeClaimExpensesWithSubmittedResponses.mockReturnValue()

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(function () {
          expect(mockMergeClaimExpensesWithSubmittedResponses).toHaveBeenCalledTimes(0)
        })
    })
  })

  describe('GET /claim/:claimId/download', function () {
    it('should respond with 200 if a valid file path is returned', function () {
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)
      mockGetClaimDocumentFilePath.mockResolvedValue(CLAIM_DOCUMENT)
      return supertest(app)
        .get('/claim/123/download?claim-document-id=55')
        .expect(200)
        .expect('content-length', '4')
    })

    it('should respond with 500 if no claim-document-id provided', function () {
      return supertest(app)
        .get('/claim/123/download')
        .expect(500)
    })

    it('should respond with 500 if no file path is provided', function () {
      mockGetClaimDocumentFilePath.mockResolvedValue()
      return supertest(app)
        .get('/claim/123/download?claim-document-id=55')
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/add-deduction', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      mockCheckUserAndLastUpdated.mockImplementation(() => { throw new ValidationError({ reason: {} }) })
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123/add-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(400)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
        })
    })

    it('should respond with 400 including extra data if claim expenses exist and there is no update conflict when a validation error occurs', function () {
      const claimData = {
        claim: {},
        claimExpenses: {}
      }
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockGetIndividualClaimDetails.mockResolvedValue(claimData)
      mockClaimDecision.mockReturnValue({})
      mockInsertDeduction.mockImplementation(() => { throw new ValidationError() })
      mockMergeClaimExpensesWithSubmittedResponses.mockReturnValue({})

      return supertest(app)
        .post('/claim/123/add-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(400)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
        })
    })

    it('should respond with 302 when valid data entered (add deduction)', function () {
      const claimData = {
        claim: {},
        claimExpenses: {}
      }
      const testClaimDecisionObject = { deductionType: 'a', amount: '5' }
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockInsertDeduction.mockResolvedValue({})
      mockClaimDeduction.mockReturnValue(testClaimDecisionObject)
      mockGetClaimExpenseResponses.mockReturnValue([{}])
      mockGetIndividualClaimDetails.mockResolvedValue(claimData)

      return supertest(app)
        .post('/claim/123/add-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(302)
        .expect(function () {
          expect(mockInsertDeduction).toHaveBeenCalledWith('123', testClaimDecisionObject)
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockInsertDeduction.mockRejectedValue()

      return supertest(app)
        .post('/claim/123/add-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/remove-deduction', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      mockCheckUserAndLastUpdated.mockImplementation(() => { throw new ValidationError({ reason: {} }) })
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123/remove-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(400)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
        })
    })

    it('should respond with 302 when valid data entered (disable deduction)', function () {
      const claimData = {
        claim: {},
        claimExpenses: {}
      }
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockDisableDeduction.mockResolvedValue({})
      mockGetIndividualClaimDetails.mockResolvedValue(claimData)

      return supertest(app)
        .post('/claim/123/remove-deduction')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(302)
        .expect(function () {
          expect(mockDisableDeduction).toHaveBeenCalledWith('1')
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockDisableDeduction.mockRejectedValue()

      return supertest(app)
        .post('/claim/123/remove-deduction')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/assign-self', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      mockCheckUserAndLastUpdated.mockImplementation(() => { throw new ValidationError({ reason: {} }) })
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123/assign-self')
        .send()
        .expect(400)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
        })
    })

    it('should respond with 200 after calling assignment with users email if no conflicts', function () {
      const claimData = {
        claim: {},
        claimExpenses: {}
      }
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockUpdateAssignmentOfClaims.mockResolvedValue()
      mockGetIndividualClaimDetails.mockResolvedValue(claimData)

      return supertest(app)
        .post('/claim/123/assign-self')
        .send()
        .expect(302)
        .expect(function () {
          expect(mockUpdateAssignmentOfClaims).toHaveBeenCalledWith('123', 'test@test.com')
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockUpdateAssignmentOfClaims.mockRejectedValue()

      return supertest(app)
        .post('/claim/123/assign-self')
        .send()
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/unassign', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      mockCheckUserAndLastUpdated.mockImplementation(() => { throw new ValidationError({ reason: {} }) })
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123/unassign')
        .send()
        .expect(400)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
        })
    })

    it('should respond with 200 after calling assignment with users email if no conflicts', function () {
      const claimData = {
        claim: {},
        claimExpenses: {}
      }
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockUpdateAssignmentOfClaims.mockResolvedValue()
      mockGetIndividualClaimDetails.mockResolvedValue(claimData)

      return supertest(app)
        .post('/claim/123/unassign')
        .send()
        .expect(302)
        .expect(function () {
          expect(mockUpdateAssignmentOfClaims).toHaveBeenCalledWith('123', null)
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockUpdateAssignmentOfClaims.mockRejectedValue()

      return supertest(app)
        .post('/claim/123/unassign')
        .send()
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/update-overpayment-status', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)
      mockCheckUserAndLastUpdated.mockImplementation(() => { throw new ValidationError({ reason: {} }) })

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_UPDATE_OVERPAYMENT_STATUS)
        .expect(400)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
        })
    })

    it('should respond with 302 when valid data entered', function () {
      const claimData = { claim: { IsOverpaid: false } }
      const overpaymentResponse = {}
      mockGetIndividualClaimDetails.mockResolvedValue(claimData)
      mockOverpaymentResponse.mockReturnValue(overpaymentResponse)
      mockUpdateClaimOverpaymentStatus.mockResolvedValue()
      mockCheckUserAndLastUpdated.mockResolvedValue()

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_UPDATE_OVERPAYMENT_STATUS)
        .expect(302)
        .expect(function () {
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockUpdateClaimOverpaymentStatus).toHaveBeenCalledWith(claimData.claim, overpaymentResponse)
        })
    })

    it('should respond with 400 when adding an overpayment and a validation error occurs', function () {
      const claimData = { claim: { IsOverpaid: false } }
      const overpaymentResponse = {}
      mockGetIndividualClaimDetails.mockResolvedValue(claimData)
      mockOverpaymentResponse.mockReturnValue(overpaymentResponse)
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockUpdateClaimOverpaymentStatus.mockImplementation(() => { throw new ValidationError() })

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_UPDATE_OVERPAYMENT_STATUS)
        .expect(400)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
          expect(mockUpdateClaimOverpaymentStatus).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)
      mockOverpaymentResponse.mockResolvedValue({})
      mockUpdateClaimOverpaymentStatus.mockRejectedValue()

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/payout-barcode-expired', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)
      mockCheckUserAndLastUpdated.mockImplementation(() => { throw new ValidationError({ reason: {} }) })

      return supertest(app)
        .post('/claim/123/payout-barcode-expired')
        .send(VALID_DATA_PAYOUT_BARCODE_EXPIRED_CLAIM)
        .expect(400)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
        })
    })

    it('should respond with 302 when valid data entered', function () {
      mockPayoutBarcodeExpiredClaim.mockResolvedValue()
      mockCheckUserAndLastUpdated.mockResolvedValue()

      return supertest(app)
        .post('/claim/123/payout-barcode-expired')
        .send(VALID_DATA_PAYOUT_BARCODE_EXPIRED_CLAIM)
        .expect(302)
        .expect(function () {
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockPayoutBarcodeExpiredClaim).toHaveBeenCalledWith('123', 'Expiry reason')
        })
    })

    it('should respond with 400 when marking claim as payout expired and a validation error occurs', function () {
      mockPayoutBarcodeExpiredClaim.mockImplementation(() => { throw new ValidationError() })
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)
      mockCheckUserAndLastUpdated.mockResolvedValue()

      return supertest(app)
        .post('/claim/123/payout-barcode-expired')
        .send(VALID_DATA_PAYOUT_BARCODE_EXPIRED_CLAIM)
        .expect(function () {
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      mockPayoutBarcodeExpiredClaim.mockRejectedValue()
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)
      mockCheckUserAndLastUpdated.mockResolvedValue()

      return supertest(app)
        .post('/claim/123/payout-barcode-expired')
        .send(VALID_DATA_PAYOUT_BARCODE_EXPIRED_CLAIM)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/insert-note', function () {
    it('should respond with 302 when valid data entered', function () {
      mockInsertNote.mockResolvedValue()
      mockCheckUserAndLastUpdated.mockResolvedValue()

      return supertest(app)
        .post('/claim/123/insert-note')
        .send(VALID_DATA_INSERT_NOTE)
        .expect(302)
        .expect(function () {
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockInsertNote).toHaveBeenCalledWith('123', 'This is a note', 'test@test.com')
        })
    })

    it('should respond with a 500 when no field blank', function () {
      mockInsertNote.mockResolvedValue()
      mockCheckUserAndLastUpdated.mockResolvedValue()

      return supertest(app)
        .post('/claim/123/insert-note')
        .send(INVALID_DATA_INSERT_NOTE)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/close-advance-claim', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)
      mockCheckUserAndLastUpdated.mockImplementation(() => { throw new ValidationError({ reason: {} }) })

      return supertest(app)
        .post('/claim/123/close-advance-claim')
        .send(VALID_DATA_CLOSE_ADVANCE_CLAIM)
        .expect(400)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
        })
    })

    it('should respond with 302 when valid data entered', function () {
      mockCloseAdvanceClaim.mockResolvedValue()
      mockCheckUserAndLastUpdated.mockResolvedValue()

      return supertest(app)
        .post('/claim/123/close-advance-claim')
        .send(VALID_DATA_CLOSE_ADVANCE_CLAIM)
        .expect(302)
        .expect(function () {
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCloseAdvanceClaim).toHaveBeenCalledWith('123', 'close advance claim reason', 'test@test.com')
        })
    })

    it('should respond with 400 when closing claim and a validation error occurs', function () {
      mockCloseAdvanceClaim.mockImplementation(() => { throw new ValidationError() })
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)
      mockCheckUserAndLastUpdated.mockResolvedValue()

      return supertest(app)
        .post('/claim/123/close-advance-claim')
        .send(VALID_DATA_CLOSE_ADVANCE_CLAIM)
        .expect(function () {
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledTimes(1)
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      mockCloseAdvanceClaim.mockRejectedValue()
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)
      mockCheckUserAndLastUpdated.mockResolvedValue()

      return supertest(app)
        .post('/claim/123/close-advance-claim')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/request-new-payment-details', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      mockGetIndividualClaimDetails.mockResolvedValue(CLAIM_RETURN)
      mockCheckUserAndLastUpdated.mockImplementation(() => { throw new ValidationError({ reason: {} }) })

      return supertest(app)
        .post('/claim/123/request-new-payment-details')
        .send(VALID_DATA_REQUEST_BANK_DETAILS)
        .expect(400)
        .expect(function () {
          expect(mockAuthorisation.hasRoles).toHaveBeenCalledTimes(1)
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockGetIndividualClaimDetails).toHaveBeenCalledWith('123')
        })
    })

    it('should respond with 302 when request bank details submitted', function () {
      mockRequestNewBankDetails.mockResolvedValue()
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockGetIndividualClaimDetails.mockResolvedValue({
        claim: {
          Reference: 'NEWBANK',
          EligibilityId: '1'
        },
        TopUps: {
          allTopUpsPaid: true
        }
      })

      return supertest(app)
        .post('/claim/123/request-new-payment-details')
        .send(VALID_DATA_REQUEST_BANK_DETAILS)
        .expect(302)
        .expect(function () {
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockRequestNewBankDetails).toHaveBeenCalledWith('NEWBANK', '1', '123', '', 'test@test.com')
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      mockCloseAdvanceClaim.mockRejectedValue()
      mockGetIndividualClaimDetails.mockResolvedValue({})
      mockCheckUserAndLastUpdated.mockResolvedValue()

      return supertest(app)
        .post('/claim/123/request-new-payment-details')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/update-benefit-expiry-date', function () {
    it('should respond with 302 when valid benefit expiry date is entered', function () {
      const claimData = {
        claim: {},
        claimExpenses: {}
      }
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockUpdateVisitorBenefirExpiryDate.mockResolvedValue()
      mockGetIndividualClaimDetails.mockResolvedValue(claimData)

      const benefitExpiryDate = {
        expiryDateFields: [VALID_BENEFIT_EXPIRY_DATA['expiry-day-input'], VALID_BENEFIT_EXPIRY_DATA['expiry-month-input'], VALID_BENEFIT_EXPIRY_DATA['expiry-year-input']],
        expiryDate: dateFormatter.build(VALID_BENEFIT_EXPIRY_DATA['expiry-day-input'], VALID_BENEFIT_EXPIRY_DATA['expiry-month-input'], VALID_BENEFIT_EXPIRY_DATA['expiry-year-input'])
      }

      mockBenefitExpiryDate.mockReturnValue(benefitExpiryDate)

      return supertest(app)
        .post('/claim/123/update-benefit-expiry-date')
        .send(VALID_BENEFIT_EXPIRY_DATA)
        .expect(302)
        .expect(function () {
          expect(mockUpdateVisitorBenefirExpiryDate).toHaveBeenCalledWith('123', benefitExpiryDate)
        })
    })
  })

  describe('POST /claim/:claimId/add-top-up', function () {
    it('should respond with 302 when valid top up data entered', function () {
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockInsertTopUp.mockResolvedValue(VALID_DATA_ADD_TOP_UP)
      mockGetIndividualClaimDetails.mockResolvedValue({
        claim: {
          Reference: 'TOPUP',
          EligibilityId: '1',
          PaymentStatus: 'PROCESSED'
        },
        TopUps: {
          allTopUpsPaid: true
        }
      })

      const topUpResponse = {
        amount: VALID_DATA_ADD_TOP_UP['top-up-amount'],
        reason: VALID_DATA_ADD_TOP_UP['top-up-reason']
      }
      mockTopupResponse.mockReturnValue(topUpResponse)

      return supertest(app)
        .post('/claim/123/add-top-up')
        .send(VALID_DATA_ADD_TOP_UP)
        .expect(302)
        .expect(function () {
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockInsertTopUp).toHaveBeenCalledTimes(1)
          expect(mockInsertTopUp).toHaveBeenCalledWith({ Reference: 'TOPUP', EligibilityId: '1', PaymentStatus: 'PROCESSED' }, topUpResponse, 'test@test.com')
        })
    })
  })

  describe('POST /claim/:claimId/cancel-top-up', function () {
    it('should respond with 302 when valid cancel top up data is sent', function () {
      mockCheckUserAndLastUpdated.mockResolvedValue()
      mockCancelTopUp.mockResolvedValue()
      mockGetIndividualClaimDetails.mockResolvedValue({
        claim: {
          Reference: 'CANCEL',
          EligibilityId: '1',
          PaymentStatus: 'PROCESSED'
        },
        TopUps: {
          allTopUpsPaid: true
        }
      })

      return supertest(app)
        .post('/claim/123/cancel-top-up')
        .send()
        .expect(302)
        .expect(function () {
          expect(mockGetClaimLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCheckUserAndLastUpdated).toHaveBeenCalledTimes(1)
          expect(mockCancelTopUp).toHaveBeenCalledTimes(1)
          expect(mockCancelTopUp).toHaveBeenCalledWith({ Reference: 'CANCEL', EligibilityId: '1', PaymentStatus: 'PROCESSED' }, 'test@test.com')
        })
    })
  })
})
