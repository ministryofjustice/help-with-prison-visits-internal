const tasksEnum = require('../../../../app/constants/tasks-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')

const mockInsertTaskSendClaimNotification = jest.fn().mockResolvedValue()
const mockInsertClaimEvent = jest.fn().mockResolvedValue()
const mockUpdateClaimStatusRequestingBankDetails = jest.fn().mockResolvedValue()

jest.mock(
  './insert-task-send-claim-notification',
  () => mockInsertTaskSendClaimNotification
)

jest.mock('./insert-claim-event', () => mockInsertClaimEvent)

jest.mock(
  './update-claim-status-requesting-bank-details',
  () => mockUpdateClaimStatusRequestingBankDetails
)

const requestNewBankDetails = require('../../../../app/services/data/request-new-bank-details')

describe('services/data/request-new-bank-details', function () {
  it('should call all of the relevant functions', function () {
    const reference = 'NEWBANK'
    const eligibilityId = 1
    const claimId = 1
    const additionalInformaiton = 'additionalInformaiton'
    const user = 'user'
    return requestNewBankDetails(reference, eligibilityId, claimId, additionalInformaiton, user)
      .then(function (result) {
        expect(mockUpdateClaimStatusRequestingBankDetails.calledWith(reference, claimId)).toBe(true) //eslint-disable-line
        expect(mockInsertClaimEvent.calledWith(reference, eligibilityId, claimId, claimEventEnum.REQUEST_NEW_BANK_DETAILS.value, additionalInformaiton, '', user, false)).toBe(true) //eslint-disable-line
        expect(mockInsertTaskSendClaimNotification.calledWith(tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION, reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      })
  })
})
