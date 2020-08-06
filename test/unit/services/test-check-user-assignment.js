var expect = require('chai').expect
const dateFormatter = require('../../../app/services/date-formatter')
var checkUserAssignment = require('../../../app/services/check-user-assignment')

describe('services/check-user-assignment', function () {
  it('should return true if user is assigned and not expired', function () {
    var user = 'testUser'
    var assignedTo = 'testUser'
    var assignmentExpiry = dateFormatter.now().add('30', 'minutes').toDate()
    expect(checkUserAssignment(user, assignedTo, assignmentExpiry)).to.be.true //eslint-disable-line
  })

  it('should return false if user is not assigned', function () {
    var user = 'testUser'
    var assignedTo = 'otherUser'
    var assignmentExpiry = dateFormatter.now().toDate()
    expect(checkUserAssignment(user, assignedTo, assignmentExpiry)).to.be.false //eslint-disable-line
  })

  it('should return if user is assigned but it is past the assignmentExpiry', function () {
    var user = 'testUser'
    var assignedTo = 'testUser'
    var assignmentExpiry = dateFormatter.now().toDate()
    expect(checkUserAssignment(user, assignedTo, assignmentExpiry)).to.be.false //eslint-disable-line
  })
})
