/* eslint-env mocha */
const moment = require('moment')
const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, insertClaimDeduction, insertClaim, deleteAll, db } = require('../../../helpers/database-setup-for-tests')
const updateRelatedClaimRemainingOverpaymentAmount = require('../../../../app/services/data/update-related-claims-remaining-overpayment-amount')

describe('services/data/update-related-claim-remaining-overpayment-amount', () => {
  const REFERENCE = 'OVERPAY'
  const date = dateFormatter.now().toDate()
  let currentClaimId
  let eligibilityId
  let claimId1
  let claimId2
  let claimId3

  beforeEach(() => {
    return insertTestData(REFERENCE, date, 'Test').then(function (ids) {
      currentClaimId = ids.claimId
      eligibilityId = ids.eligibilityId

      claimId1 = currentClaimId + 1
      claimId2 = currentClaimId + 2
      claimId3 = currentClaimId + 3

      return insertClaimDeduction(currentClaimId, REFERENCE, eligibilityId, 'overpayment', 95)
    })
  })

  it('should reduce remaining overpayment total to £20 when deduction total < remaining overpayment total (single overpaid claim)', () => {
    // Deduction Total - £100
    // Remaining Overpayment Total - £120
    return insertClaim(claimId1, eligibilityId, REFERENCE, date, 'Test', true, 240, 120)
      .then(() => {
        return updateRelatedClaimRemainingOverpaymentAmount(currentClaimId, REFERENCE)
      })
      .then(() => {
        return checkClaimOverpaymentValues(claimId1, 20, true)
      })
  })

  it('should reduce remaining overpayment total to 0 when deduction total > remaining overpayment total (single overpaid claim)', () => {
    // Deduction Total - £100
    // Remaining Overpayment Total - £80
    return insertClaim(claimId1, eligibilityId, REFERENCE, date, 'Test', true, 160, 80)
      .then(() => {
        return updateRelatedClaimRemainingOverpaymentAmount(currentClaimId, REFERENCE)
      })
      .then(() => {
        return checkClaimOverpaymentValues(claimId1, 0, false)
      })
  })

  it('should reduce remaining overpayment total to 0 when deduction total = remaining overpayment total (single overpaid claim)', () => {
    // Deduction Total - £100
    // Remaining Overpayment Total - £100
    return insertClaim(claimId1, eligibilityId, REFERENCE, date, 'Test', true, 200, 100)
      .then(() => {
        return updateRelatedClaimRemainingOverpaymentAmount(currentClaimId, REFERENCE)
      })
      .then(() => {
        return checkClaimOverpaymentValues(claimId1, 0, false)
      })
  })

  it('should reduce remaining overpayment total to £20 when deduction total < remaining overpayment total (multiple overpaid claims)', () => {
    // Deduction Total - £100
    // Remaining Overpayment Total - £40 + £40 + £40
    const date1 = moment(date).add(10, 'days').toDate()
    const date2 = moment(date).add(20, 'days').toDate()

    return insertClaim(claimId1, eligibilityId, REFERENCE, date, 'Test', true, 80, 40)
      .then(() => {
        return insertClaim(claimId2, eligibilityId, REFERENCE, date1, 'Test', true, 80, 40)
      })
      .then(() => {
        return insertClaim(claimId3, eligibilityId, REFERENCE, date2, 'Test', true, 80, 40)
      })
      .then(() => {
        return updateRelatedClaimRemainingOverpaymentAmount(currentClaimId, REFERENCE)
      })
      .then(() => {
        return db('Claim').where('ClaimId', claimId1).first()
      })
      .then(() => {
        return checkClaimOverpaymentValues(claimId1, 0, false)
      })
      .then(() => {
        return checkClaimOverpaymentValues(claimId2, 0, false)
      })
      .then(() => {
        return checkClaimOverpaymentValues(claimId3, 20, true)
      })
  })

  it('should reduce remaining overpayment total to 0 when deduction total > remaining overpayment total (multiple overpaid claims)', () => {
    // Deduction Total - £100
    // Remaining Overpayment Total - £40 + £20 + £20
    const date1 = moment(date).add(10, 'days').toDate()
    const date2 = moment(date).add(20, 'days').toDate()

    return insertClaim(claimId1, eligibilityId, REFERENCE, date, 'Test', true, 80, 40)
      .then(() => {
        return insertClaim(claimId2, eligibilityId, REFERENCE, date1, 'Test', true, 40, 20)
      })
      .then(() => {
        return insertClaim(claimId3, eligibilityId, REFERENCE, date2, 'Test', true, 40, 20)
      })
      .then(() => {
        return updateRelatedClaimRemainingOverpaymentAmount(currentClaimId, REFERENCE)
      })
      .then(() => {
        return db('Claim').where('ClaimId', claimId1).first()
      })
      .then(() => {
        return checkClaimOverpaymentValues(claimId1, 0, false)
      })
      .then(() => {
        return checkClaimOverpaymentValues(claimId2, 0, false)
      })
      .then(() => {
        return checkClaimOverpaymentValues(claimId3, 0, false)
      })
  })

  it('should reduce remaining overpayment total to 0 when deduction total = remaining overpayment total (multiple overpaid claims)', () => {
    // Deduction Total - £100
    // Remaining Overpayment Total - £40 + £30 + £30
    const date1 = moment(date).add(10, 'days').toDate()
    const date2 = moment(date).add(20, 'days').toDate()

    return insertClaim(claimId1, eligibilityId, REFERENCE, date, 'Test', true, 80, 40)
      .then(() => {
        return insertClaim(claimId2, eligibilityId, REFERENCE, date1, 'Test', true, 60, 30)
      })
      .then(() => {
        return insertClaim(claimId3, eligibilityId, REFERENCE, date2, 'Test', true, 60, 30)
      })
      .then(() => {
        return updateRelatedClaimRemainingOverpaymentAmount(currentClaimId, REFERENCE)
      })
      .then(() => {
        return checkClaimOverpaymentValues(claimId1, 0, false)
      })
      .then(() => {
        return checkClaimOverpaymentValues(claimId2, 0, false)
      })
      .then(() => {
        return checkClaimOverpaymentValues(claimId3, 0, false)
      })
  })

  it('should not change remaining overpayment total or overpayment status if current claim has no overpayment deductions', () => {
    const remainingOverpaymentAmount = 40
    return db('ClaimDeduction').where('Reference', REFERENCE).del()
      .then(() => {
        return insertClaim(claimId1, eligibilityId, REFERENCE, date, 'Test', true, remainingOverpaymentAmount, remainingOverpaymentAmount)
      })
      .then(() => {
        return updateRelatedClaimRemainingOverpaymentAmount(currentClaimId, REFERENCE)
      })
      .then(() => {
        return checkClaimOverpaymentValues(claimId1, remainingOverpaymentAmount, true)
      })
  })

  afterEach(() => {
    return deleteAll(REFERENCE)
  })
})

function checkClaimOverpaymentValues (claimId, remainingOverpaymentAmount, isOverpaid) {
  return db('Claim').where('ClaimId', claimId).first()
    .then(claim => {
      expect(claim.RemainingOverpaymentAmount).toBe(remainingOverpaymentAmount)
      expect(claim.IsOverpaid).toBe(isOverpaid)
    })
}
