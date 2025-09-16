const dateFormatter = require('../../../app/services/date-formatter')
const ValidationError = require('../../../app/services/errors/validation-error')
const ValidationErrorMessages = require('../../../app/services/validators/validation-error-messages')

const USER = 'test@test.com'
const OTHER_USER = 'other@test.com'

const mockCheckUserAssignment = jest.fn()

jest.mock('../../../app/services/check-user-assignment', () => mockCheckUserAssignment)

const checkUserAndLastUpdated = require('../../../app/services/check-user-and-last-updated')

describe('services/check-user-and-last-updated', () => {
  describe('Last updated', () => {
    const needAssignmentCheck = false
    it('should resolve if all details are correct', () => {
      const lastUpdatedData = { LastUpdated: dateFormatter.now().toDate() }
      const previousLastUpdated = dateFormatter.now().toString()
      expect(checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)).toBeTruthy()
    })

    it('should throw validation error if lastUpdated is different', () => {
      const lastUpdatedData = { LastUpdated: dateFormatter.now().toDate() }
      const previousLastUpdated = dateFormatter.now().add('1', 'day').toString()
      try {
        checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)
        // should have throw error
        expect(false).toBe(true)
      } catch (error) {
        expect(error).not.toBeNull()
        expect(error).toBeInstanceOf(ValidationError)
      }
    })
  })

  describe('User assignment', () => {
    let lastUpdatedData
    let previousLastUpdated
    let needAssignmentCheck

    beforeAll(() => {
      lastUpdatedData = {
        LastUpdated: dateFormatter.now().toDate(),
        AssignmentExpiry: dateFormatter.now().add('1', 'day'),
      }
      previousLastUpdated = dateFormatter.now().toString()
      needAssignmentCheck = true
    })
    it('should resolve if all details are correct', () => {
      mockCheckUserAssignment.mockReturnValue(true)
      expect(checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)).toBeTruthy()
    })

    it('should throw validation error for other user assigned', () => {
      mockCheckUserAssignment.mockReturnValue(false)
      lastUpdatedData.AssignedTo = OTHER_USER
      try {
        checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)
        // should have throw error
        expect(false).toBe(true)
      } catch (error) {
        expect(error).not.toBeNull()
        expect(error).toBeInstanceOf(ValidationError)
        expect(error.validationErrors.UpdateConflict[0]).toBe(
          ValidationErrorMessages.getUserAssignmentConflict(OTHER_USER),
        )
      }
    })

    it('should throw validation error for user not assigned', () => {
      mockCheckUserAssignment.mockReturnValue(false)
      lastUpdatedData.AssignedTo = null
      try {
        checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)
        // should have throw error
        expect(false).toBe(true)
      } catch (error) {
        expect(error).not.toBeNull()
        expect(error).toBeInstanceOf(ValidationError)
        expect(error.validationErrors.UpdateConflict[0]).toBe(ValidationErrorMessages.getUserNotAssigned())
      }
    })
  })
})
