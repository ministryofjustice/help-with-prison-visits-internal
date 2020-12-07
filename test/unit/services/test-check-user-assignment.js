const expect = require('chai').expect
const dateFormatter = require('../../../app/services/date-formatter')
const checkUserAssignment = require('../../../app/services/check-user-assignment')

describe('services/check-user-assignment', function () {
  it('should return true if user is assigned and not expired', function () {
    const user = 'testUser'
    const assignedTo = 'testUser'
    const assignmentExpiry = dateFormatter.now().add('30', 'minutes').toDate()
    expect(checkUserAssignment(user, assignedTo, assignmentExpiry)).to.be.true //eslint-disable-line
  })

  it('should return false if user is not assigned', function () {
    const user = 'testUser'
    const assignedTo = 'otherUser'
    const assignmentExpiry = dateFormatter.now().toDate()
    expect(checkUserAssignment(user, assignedTo, assignmentExpiry)).to.be.false //eslint-disable-line
  })

  it('should return if user is assigned but it is past the assignmentExpiry', function () {
    const user = 'testUser'
    const assignedTo = 'testUser'
    const assignmentExpiry = dateFormatter.now().toDate()
    expect(checkUserAssignment(user, assignedTo, assignmentExpiry)).to.be.false //eslint-disable-line
  })
})
