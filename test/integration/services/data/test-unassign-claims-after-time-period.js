const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const config = require('../../../../knexfile').intweb
const knex = require('knex')(config)
const databaseHelper = require('../../../helpers/database-setup-for-tests')

const unassignClaims = require('../../../../app/services/data/unassign-claims-after-time-period')
var reference = 'UNASSIGN'
var date
var claimId

describe('services/data/unassign-claims-after-time-period', function () {
  describe('module', function () {
    before(function () {
      date = dateFormatter.now()
      return databaseHelper.insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
      })
    })

    it(`should unassign claims after period of time making AssignTo and AssignmentTime null updated LastUpdated`, function () {
      return unassignClaims()
        .then(function () {
          return knex('Claim').first().where('ClaimId', claimId)
            .then(function (claim) {
              expect(claim.AssignedTo).to.equal(null)
              expect(claim.AssignmentTime).to.equal(null)
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
