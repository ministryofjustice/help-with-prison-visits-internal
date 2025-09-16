const dateFormatter = require('../../../app/services/date-formatter')
const checkUserAssignment = require('../../../app/services/check-user-assignment')

describe('services/check-user-assignment', () => {
  it('should return true if user is assigned and not expired', () => {
    const user = 'testUser'
    const assignedTo = 'testUser'
    const assignmentExpiry = dateFormatter.now().add('30', 'minutes').toDate()
    expect(checkUserAssignment(user, assignedTo, assignmentExpiry)).toBe(true)
  })

  it('should return false if user is not assigned', () => {
    const user = 'testUser'
    const assignedTo = 'otherUser'
    const assignmentExpiry = dateFormatter.now().toDate()
    expect(checkUserAssignment(user, assignedTo, assignmentExpiry)).toBe(false)
  })

  it('should return if user is assigned but it is past the assignmentExpiry', () => {
    const user = 'testUser'
    const assignedTo = 'testUser'
    const assignmentExpiry = dateFormatter.now().toDate()
    expect(checkUserAssignment(user, assignedTo, assignmentExpiry)).toBe(false)
  })
})
