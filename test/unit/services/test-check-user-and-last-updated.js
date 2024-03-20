const dateFormatter = require('../../../app/services/date-formatter')
const ValidationError = require('../../../app/services/errors/validation-error')
const ValidationErrorMessages = require('../../../app/services/validators/validation-error-messages')
const sinon = require('sinon')

const USER = 'test@test.com'
const OTHER_USER = 'other@test.com'

const checkUserAssignmentStub = jest.fn()

jest.mock('./check-user-assignment', () => checkUserAssignmentStub);

const checkUserAndLastUpdated = require('../../../app/services/check-user-and-last-updated')

describe('services/check-user-and-last-updated', function () {
  describe('Last updated', function () {
    const needAssignmentCheck = false
    it('should resolve if all details are correct', function () {
      const lastUpdatedData = { LastUpdated: dateFormatter.now().toDate() }
      const previousLastUpdated = dateFormatter.now().toString()
      expect(checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)).toBeTruthy() //eslint-disable-line
    })

    it('should throw validation error if lastUpdated is different', function () {
      const lastUpdatedData = { LastUpdated: dateFormatter.now().toDate() }
      const previousLastUpdated = dateFormatter.now().add('1', 'day').toString()
      try {
        checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)
        // should have throw error
        expect(false).toBe(true) //eslint-disable-line
      } catch (error) {
        expect(error).not.toBeNull() //eslint-disable-line
        expect(error).toBeInstanceOf(ValidationError)
      }
    })
  })

  describe('User assignment', function () {
    let lastUpdatedData
    let previousLastUpdated
    let needAssignmentCheck

    beforeAll(function () {
      lastUpdatedData = { LastUpdated: dateFormatter.now().toDate(), AssignmentExpiry: dateFormatter.now().add('1', 'day') }
      previousLastUpdated = dateFormatter.now().toString()
      needAssignmentCheck = true
    })
    it('should resolve if all details are correct', function () {
      checkUserAssignmentStub.mockReturnValuetrue)
      expect(checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)).toBeTruthy() //eslint-disable-line
    })

    it('should throw validation error for other user assigned', function () {
      checkUserAssignmentStub.mockReturnValuefalse)
      lastUpdatedData.AssignedTo = OTHER_USER
      try {
        checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)
        // should have throw error
        expect(false).toBe(true) //eslint-disable-line
      } catch (error) {
        expect(error).not.toBeNull() //eslint-disable-line
        expect(error).toBeInstanceOf(ValidationError)
        expect(error.validationErrors.UpdateConflict[0]).toBe(ValidationErrorMessages.getUserAssignmentConflict(OTHER_USER))
      }
    })

    it('should throw validation error for user not assigned', function () {
      checkUserAssignmentStub.mockReturnValuefalse)
      lastUpdatedData.AssignedTo = null
      try {
        checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)
        // should have throw error
        expect(false).toBe(true) //eslint-disable-line
      } catch (error) {
        expect(error).not.toBeNull() //eslint-disable-line
        expect(error).toBeInstanceOf(ValidationError)
        expect(error.validationErrors.UpdateConflict[0]).toBe(ValidationErrorMessages.getUserNotAssigned())
      }
    })
  })
})
