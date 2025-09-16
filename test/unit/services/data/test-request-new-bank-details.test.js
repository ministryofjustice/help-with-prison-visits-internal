const tasksEnum = require('../../../../app/constants/tasks-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')

const mockInsertTaskSendClaimNotification = jest.fn().mockResolvedValue()
const mockInsertClaimEvent = jest.fn().mockResolvedValue()
const mockUpdateClaimStatusRequestingBankDetails = jest.fn().mockResolvedValue()

jest.mock(
  '../../../../app/services/data/insert-task-send-claim-notification',
  () => mockInsertTaskSendClaimNotification,
)

jest.mock('../../../../app/services/data/insert-claim-event', () => mockInsertClaimEvent)

jest.mock(
  '../../../../app/services/data/update-claim-status-requesting-bank-details',
  () => mockUpdateClaimStatusRequestingBankDetails,
)

const requestNewBankDetails = require('../../../../app/services/data/request-new-bank-details')

describe('services/data/request-new-bank-details', () => {
  it('should call all of the relevant functions', () => {
    const reference = 'NEWBANK'
    const eligibilityId = 1
    const claimId = 1
    const additionalInformaiton = 'additionalInformaiton'
    const user = 'user'
    return requestNewBankDetails(reference, eligibilityId, claimId, additionalInformaiton, user).then(result => {
      expect(mockUpdateClaimStatusRequestingBankDetails).toHaveBeenCalledWith(reference, claimId)
      expect(mockInsertClaimEvent).toHaveBeenCalledWith(
        reference,
        eligibilityId,
        claimId,
        claimEventEnum.REQUEST_NEW_BANK_DETAILS.value,
        additionalInformaiton,
        '',
        user,
        false,
      )
      expect(mockInsertTaskSendClaimNotification).toHaveBeenCalledWith(
        tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION,
        reference,
        eligibilityId,
        claimId,
      )
    })
  })
})
