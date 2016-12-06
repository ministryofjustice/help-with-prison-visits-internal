var expect = require('chai').expect
var updateAutoApprovalConfig = require('../../../../app/services/data/update-auto-approval-config')
var config = require('../../../../knexfile').migrations
var knex = require('knex')(config)
var moment = require('moment')

describe('services/data/update-auto-approval-config', function () {
  var insertedIds = []

  before(function () {
    return knex('AutoApprovalConfig')
      .insert({
        Caseworker: 'first-caseworker',
        DateCreated: moment().toDate(),
        AutoApprovalEnabled: 'true',
        CostVariancePercentage: '5.00',
        MaxClaimTotal: '100.00',
        MaxDaysAfterAPVUVisit: '28',
        MaxNumberOfClaimsPerYear: '10',
        RulesDisabled: ['auto-approval-rule-1', 'auto-approval-rule-2', 'auto-approval-rule-3'],
        IsEnabled: 'true'
      })
      .returning('AutoApprovalConfigId')
      .then(function (result) {
        insertedIds.push(result[0])
      })
  })

  it('should disable the current Auto Approval config and insert the new one', function () {
    return updateAutoApprovalConfig('second-caseworker', 'true', null, null, null,
      null, ['auto-approval-rule-1', 'auto-approval-rule-2'])
      .then(function (result) {
        insertedIds.push(result[0])
        return knex('AutoApprovalConfig')
          .where('IsEnabled', true)
          .orderBy('DateCreated', 'desc')
          .first()
          .then(function (result) {
            expect(result.Caseworker).to.equal('second-caseworker')
            expect(result.AutoApprovalEnabled).to.equal(true)
            expect(result.CostVariancePercentage).to.equal(null)
            expect(result.RulesDisabled).to.equal('auto-approval-rule-1,auto-approval-rule-2')
          })
      })
  })

  it('should disable the current Auto Approval config and insert the new one if rulesDisabled is null', function () {
    return updateAutoApprovalConfig('second-caseworker', 'false', null, null, null,
      null, null)
      .then(function (result) {
        insertedIds.push(result[0])
        return knex('AutoApprovalConfig')
          .where('IsEnabled', true)
          .orderBy('DateCreated', 'desc')
          .first()
          .then(function (result) {
            expect(result.Caseworker).to.equal('second-caseworker')
            expect(result.AutoApprovalEnabled).to.equal(false)
            expect(result.CostVariancePercentage).to.equal(null)
            expect(result.RulesDisabled).to.equal(null)
          })
      })
  })

  after(function () {
    return knex('AutoApprovalConfig')
      .whereIn('AutoApprovalConfigId', insertedIds)
      .del()
  })
})
