const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const tasksEnum = require('../../../../app/constants/tasks-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')

const insertTaskSendClaimNotificationStub = sinon.stub().resolves()
const insertClaimEventStub = sinon.stub().resolves()
const updateClaimStatusRequestingBankDetailsStub = sinon.stub().resolves()

const requestNewBankDetails = proxyquire('../../../../app/services/data/request-new-bank-details', {
  './insert-task-send-claim-notification': insertTaskSendClaimNotificationStub,
  './insert-claim-event': insertClaimEventStub,
  './update-claim-status-requesting-bank-details': updateClaimStatusRequestingBankDetailsStub
})

describe('services/data/request-new-bank-details', function () {
  it('should call all of the relevant functions', function () {
    const reference = 'NEWBANK'
    const eligibilityId = 1
    const claimId = 1
    const additionalInformaiton = 'additionalInformaiton'
    const user = 'user'
    return requestNewBankDetails(reference, eligibilityId, claimId, additionalInformaiton, user)
      .then(function (result) {
        expect(updateClaimStatusRequestingBankDetailsStub.calledWith(reference, claimId)).to.be.true //eslint-disable-line
        expect(insertClaimEventStub.calledWith(reference, eligibilityId, claimId, claimEventEnum.REQUEST_NEW_BANK_DETAILS.value, additionalInformaiton, '', user, false)).to.be.true //eslint-disable-line
        expect(insertTaskSendClaimNotificationStub.calledWith(tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION, reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      })
  })
})
