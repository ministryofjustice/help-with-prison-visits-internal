// const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')
// const dateFormatter = require('../../../../app/services/date-formatter')

// const sandbox = sinon.createSandbox()
// const stubInsertClaimEvent = sandbox.stub().mockResolvedValue()
// const stubInsertTaskSendClaimNotification = sandbox.stub().mockResolvedValue()

// jest.mock('../../../../app/services/data/insert-claim-event', () => stubInsertClaimEvent)

// jest.mock(
//   '../../../../app/services/data/insert-task-send-claim-notification',
//   () => stubInsertTaskSendClaimNotification
// )

// const updateVisitorContactDetails = require('../../../../app/services/data/update-visitor-contact-details')

// const REFERENCE = 'UPDVISC'
// const NEW_EMAIL_ADDRESS = 'new@new.com'
// const NEW_PHONE_NUMBER = '987654321'
// const OLD_EMAIL_ADDRESS = 'old@old.com'
// const OLD_PHONE_NUMBER = '123456789'
// const CASEWORKER = 'test@test.com'

// let eligibilityId
// let claimId

// describe('services/data/update-visitor-contact-details', () => {
//   beforeEach(() => {
//     sandbox.reset()
//   })

//   beforeAll(() => {
//     return insertTestData(REFERENCE, dateFormatter.now().toDate(), 'Test').then(function (ids) {
//       eligibilityId = ids.eligibilityId
//       claimId = ids.claimId
//     })
//   })

//   it('should update the visitor contact details, create a claim event and insert two claim notifications', () => {
//     return updateVisitorContactDetails(REFERENCE, eligibilityId, claimId, NEW_EMAIL_ADDRESS, NEW_PHONE_NUMBER, OLD_EMAIL_ADDRESS, OLD_PHONE_NUMBER, CASEWORKER)
//       .then(() => {
//         return getVisitor(eligibilityId)
//       })
//       .then(function (visitor) {
//         expect(visitor.EmailAddress).toBe(NEW_EMAIL_ADDRESS)
//         expect(visitor.PhoneNumber).toBe(NEW_PHONE_NUMBER)
//         expect(stubInsertClaimEvent.calledOnce).toBe(true)
//         expect(stubInsertTaskSendClaimNotification.calledTwice).toBe(true)
//       })
//   })

//   afterAll(() => {
//     return deleteAll(REFERENCE)
//   })
// })

// function getVisitor (eligibilityId) {
//   return db('Visitor').first()
//     .where('EligibilityId', eligibilityId)
// }
