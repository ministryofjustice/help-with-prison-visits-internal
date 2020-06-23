const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const tasksEnum = require('../../../../app/constants/tasks-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')

var insertTaskSendClaimNotificationStub = sinon.stub().resolves()
var insertClaimEventStub = sinon.stub().resolves()
var updateClaimStatusRequestingBankDetailsStub = sinon.stub().resolves()

var requestNewBankDetails = proxyquire('../../../../app/services/data/request-new-bank-details', {
  './insert-task-send-claim-notification': insertTaskSendClaimNotificationStub,
  './insert-claim-event': insertClaimEventStub,
  './update-claim-status-requesting-bank-details': updateClaimStatusRequestingBankDetailsStub
})

describe('services/data/request-new-bank-details', function () {
  it('should call all of the relevant functions', function () {
    var reference = 'NEWBANK'
    var eligibilityId = 1
    var claimId = 1
    var additionalInformaiton = 'additionalInformaiton'
    var user = 'user'
    return requestNewBankDetails(reference, eligibilityId, claimId, additionalInformaiton, user)
      .then(function (result) {
        expect(updateClaimStatusRequestingBankDetailsStub.calledWith(reference, claimId)).to.be.true //eslint-disable-line
        expect(insertClaimEventStub.calledWith(reference, eligibilityId, claimId, claimEventEnum.REQUEST_NEW_BANK_DETAILS.value, additionalInformaiton, '', user, false)).to.be.true //eslint-disable-line
        expect(insertTaskSendClaimNotificationStub.calledWith(tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION, reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      })
  })
})
