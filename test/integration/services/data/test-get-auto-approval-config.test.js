const getAutoApprovalConfig = require('../../../../app/services/data/get-auto-approval-config')
const { db } = require('../../../helpers/database-setup-for-tests')
const config = require('../../../../config')
const dateFormatter = require('../../../../app/services/date-formatter')
let insertedIds

describe('services/data/get-auto-approval-config', () => {
  let existingAutoApprovalId

  beforeAll(() => {
    return getCurrentAutoApprovalConfigId()
      .then(function (currentAutoApprovalConfigId) {
        if (currentAutoApprovalConfigId) {
          existingAutoApprovalId = currentAutoApprovalConfigId.AutoApprovalConfigId
          return setIsEnabled(existingAutoApprovalId, false)
        }

        return Promise.resolve()
      })
  })

  it('should return auto approval config defaults when no auto approval config data is found', () => {
    return getAutoApprovalConfig()
      .then(result => {
        expect(result.AutoApprovalEnabled).toBe(config.AUTO_APPROVAL_ENABLED === 'true')
        expect(result.CostVariancePercentage).toBe(parseFloat(config.AUTO_APPROVAL_COST_VARIANCE))
        expect(result.MaxClaimTotal).toBe(parseFloat(config.AUTO_APPROVAL_MAX_CLAIM_TOTAL))
        expect(result.MaxDaysAfterAPVUVisit).toBe(parseInt(config.AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT))
        expect(result.MaxNumberOfClaimsPerYear).toBe(parseInt(config.AUTO_APPROVAL_MAX_CLAIMS_PER_YEAR))
        expect(result.MaxNumberOfClaimsPerMonth).toBe(parseInt(config.AUTO_APPROVAL_MAX_CLAIMS_PER_MONTH))
        expect(result.RulesDisabled).toBeNull()
        expect(result.NumberOfConsecutiveAutoApprovals).toBe(parseInt(config.AUTO_APPROVAL_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS))
      })
  })

  it('should return the latest auto approval config record', () => {
    return insertTestData()
      .then(() => {
        return getAutoApprovalConfig()
      })
      .then(result => {
        expect(result.Caseworker).toBe('caseworker1@test.com')
        expect(result.RulesDisabled).toEqual(['auto-approval-rule-1', 'auto-approval-rule-2', 'auto-approval-rule-3'])
        expect(result.IsEnabled).toBe(true)
      })
  })

  afterAll(() => {
    return db('AutoApprovalConfig')
      .whereIn('AutoApprovalConfigId', [insertedIds])
      .del()
      .then(() => {
        if (existingAutoApprovalId) {
          return setIsEnabled(existingAutoApprovalId, true)
        }
      })
  })
})

function insertTestData () {
  return db('AutoApprovalConfig')
    .insert([{
      Caseworker: 'caseworker1@test.com',
      DateCreated: dateFormatter.now().toDate(),
      AutoApprovalEnabled: 'true',
      CostVariancePercentage: '5.00',
      MaxClaimTotal: '100.00',
      MaxDaysAfterAPVUVisit: '28',
      MaxNumberOfClaimsPerYear: '10',
      MaxNumberOfClaimsPerMonth: '2',
      RulesDisabled: 'auto-approval-rule-1,auto-approval-rule-2,auto-approval-rule-3',
      IsEnabled: 'true'
    },
    {
      Caseworker: 'caseworker2@test.com',
      DateCreated: dateFormatter.now().subtract(1, 'day').toDate(),
      AutoApprovalEnabled: 'true',
      CostVariancePercentage: '5.00',
      MaxClaimTotal: '100.00',
      MaxDaysAfterAPVUVisit: '28',
      MaxNumberOfClaimsPerYear: '10',
      MaxNumberOfClaimsPerMonth: '2',
      RulesDisabled: 'auto-approval-rule-1,auto-approval-rule-3',
      IsEnabled: 'false'
    }])
    .returning('AutoApprovalConfigId')
    .then(result => {
      insertedIds = result[0].AutoApprovalConfigId
    })
}

function setIsEnabled (autoApprovalConfigId, isEnabled) {
  return db('AutoApprovalConfig')
    .where('AutoApprovalConfigId', autoApprovalConfigId)
    .update({
      IsEnabled: isEnabled
    })
}

function getCurrentAutoApprovalConfigId () {
  return db('AutoApprovalConfig')
    .first()
    .where('IsEnabled', true)
    .select('AutoApprovalConfigId')
}
