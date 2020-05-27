const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const config = require('../../../../knexfile').intweb
const knex = require('knex')(config)
const databaseHelper = require('../../../helpers/database-setup-for-tests')
const environmentVariables = require('../../../../config')

const updateAssignmentOfClaims = require('../../../../app/services/data/update-assignment-of-claims')
var reference = 'ASSIGN1'
var date
var claimId

describe('services/data/update-assignment-of-claim', function () {
  describe('module', function () {
    before(function () {
      date = dateFormatter.now()
      return databaseHelper.insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
      })
    })

    it('should assign a claim, setting the time and updating when it was last updated', function () {
      var assignedTo = 'test@test.com'
      var expiryTime = parseInt(environmentVariables.ASSIGNMENT_EXPIRY_TIME)
      var currentDate = dateFormatter.now()
      var twoMinutesAgoExpiry = dateFormatter.now().minutes(currentDate.get('minutes') + (expiryTime - 2))
      var twoMinutesAheadExpiry = dateFormatter.now().minutes(currentDate.get('minutes') + (expiryTime + 2))
      var twoMinutesAgo = dateFormatter.now().minutes(currentDate.get('minutes') - 2)
      var twoMinutesAhead = dateFormatter.now().minutes(currentDate.get('minutes') + 2)
      return updateAssignmentOfClaims(claimId, assignedTo)
        .then(function () {
          return knex('Claim').first().where('ClaimId', claimId)
            .then(function (claim) {
              expect(claim.AssignedTo).to.equal(assignedTo)
              expect(claim.AssignmentExpiry).to.be.within(twoMinutesAgoExpiry.toDate(), twoMinutesAheadExpiry.toDate())
              expect(claim.LastUpdated).to.be.within(twoMinutesAgo.toDate(), twoMinutesAhead.toDate())
            })
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function () {
      return databaseHelper.deleteAll(reference)
    })
  })
})
