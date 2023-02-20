const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')
const environmentVariables = require('../../../../config')

const updateAssignmentOfClaims = require('../../../../app/services/data/update-assignment-of-claims')
const reference = 'ASSIGN1'
let date
let claimId

describe('services/data/update-assignment-of-claim', function () {
  describe('module', function () {
    before(function () {
      date = dateFormatter.now()
      return insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
      })
    })

    it('should assign a claim, setting the time and updating when it was last updated', function () {
      const assignedTo = 'test@test.com'
      const expiryTime = parseInt(environmentVariables.ASSIGNMENT_EXPIRY_TIME)
      const currentDate = dateFormatter.now()
      const twoMinutesAgoExpiry = dateFormatter.now().minutes(currentDate.get('minutes') + (expiryTime - 2))
      const twoMinutesAheadExpiry = dateFormatter.now().minutes(currentDate.get('minutes') + (expiryTime + 2))
      const twoMinutesAgo = dateFormatter.now().minutes(currentDate.get('minutes') - 2)
      const twoMinutesAhead = dateFormatter.now().minutes(currentDate.get('minutes') + 2)
      return updateAssignmentOfClaims(claimId, assignedTo)
        .then(function () {
          return db('Claim').first().where('ClaimId', claimId)
        })
        .then(function (claim) {
          expect(claim.AssignedTo).to.equal(assignedTo)
          expect(claim.AssignmentExpiry).to.be.within(twoMinutesAgoExpiry.toDate(), twoMinutesAheadExpiry.toDate())
          expect(claim.LastUpdated).to.be.within(twoMinutesAgo.toDate(), twoMinutesAhead.toDate())
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function () {
      return deleteAll(reference)
    })
  })
})
