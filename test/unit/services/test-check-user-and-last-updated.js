var expect = require('chai').expect
const dateFormatter = require('../../../app/services/date-formatter')
const proxyquire = require('proxyquire')
const ValidationError = require('../../../app/services/errors/validation-error')
const ValidationErrorMessages = require('../../../app/services/validators/validation-error-messages')
const sinon = require('sinon')
require('sinon-bluebird')

const USER = 'test@test.com'
const OTHER_USER = 'other@test.com'

var checkUserAssignmentStub = sinon.stub()

const checkUserAndLastUpdated = proxyquire('../../../app/services/check-user-and-last-updated', {
  './check-user-assignment': checkUserAssignmentStub
})

describe('services/check-user-and-last-updated', function () {
  describe('Last updated', function () {
    var needAssignmentCheck = false
    it('should resolve if all details are correct', function () {
      var lastUpdatedData = {LastUpdated: dateFormatter.now().toDate()}
      var previousLastUpdated = dateFormatter.now().toString()
      expect(checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)).to.be.ok
    })

    it('should throw validation error if lastUpdated is different', function () {
      var lastUpdatedData = {LastUpdated: dateFormatter.now().toDate()}
      var previousLastUpdated = dateFormatter.now().add('1', 'day').toString()
      try {
        checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)
        expect(false, 'should have throw error').to.be.true
      } catch (error) {
        expect(error).not.to.be.null
        expect(error).to.be.instanceof(ValidationError)
      }
    })
  })

  describe('User assignment', function () {
    var lastUpdatedData
    var previousLastUpdated
    var needAssignmentCheck

    before(function () {
      lastUpdatedData = {LastUpdated: dateFormatter.now().toDate(), AssignmentExpiry: dateFormatter.now().add('1', 'day')}
      previousLastUpdated = dateFormatter.now().toString()
      needAssignmentCheck = true
    })
    it('should resolve if all details are correct', function () {
      checkUserAssignmentStub.returns(true)
      expect(checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)).to.be.ok
    })

    it('should throw validation error for other user assigned', function () {
      checkUserAssignmentStub.returns(false)
      lastUpdatedData.AssignedTo = OTHER_USER
      try {
        checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)
        expect(false, 'should have throw error').to.be.true
      } catch (error) {
        expect(error).not.to.be.null
        expect(error).to.be.instanceof(ValidationError)
        expect(error.validationErrors.UpdateConflict[0]).to.be.equal(ValidationErrorMessages.getUserAssignmentConflict(OTHER_USER))
      }
    })

    it('should throw validation error for user not assigned', function () {
      checkUserAssignmentStub.returns(false)
      lastUpdatedData.AssignedTo = null
      try {
        checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, needAssignmentCheck, USER)
        expect(false, 'should have throw error').to.be.true
      } catch (error) {
        expect(error).not.to.be.null
        expect(error).to.be.instanceof(ValidationError)
        expect(error.validationErrors.UpdateConflict[0]).to.be.equal(ValidationErrorMessages.getUserNotAssigned())
      }
    })
  })
})
