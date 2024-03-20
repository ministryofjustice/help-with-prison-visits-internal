const sinon = require('sinon')

const getAutoApprovedClaimCountStub = jest.fn().mockResolvedValue([{ Count: 0 }])
const getInProgressClaimCountStub = jest.fn().mockResolvedValue([{ Count: 0 }])
const getManuallyApprovedClaimCountStub = jest.fn().mockResolvedValue([{ Count: 0 }])
const getPaidClaimCountStub = jest.fn().mockResolvedValue([{ Count: 0 }])
const getPendingClaimCountStub = jest.fn().mockResolvedValue([{ Count: 0 }])
const getRejectedClaimCountStub = jest.fn().mockResolvedValue([{ Count: 0 }])

jest.mock(
  '../../../services/data/dashboard/get-auto-approved-claim-count',
  () => getAutoApprovedClaimCountStub
)

jest.mock(
  '../../../services/data/dashboard/get-in-progress-claim-count',
  () => getInProgressClaimCountStub
)

jest.mock(
  '../../../services/data/dashboard/get-manually-approved-claim-count',
  () => getManuallyApprovedClaimCountStub
)

jest.mock(
  '../../../services/data/dashboard/get-paid-claim-count',
  () => getPaidClaimCountStub
)

jest.mock(
  '../../../services/data/dashboard/get-pending-claim-count',
  () => getPendingClaimCountStub
)

jest.mock(
  '../../../services/data/dashboard/get-rejected-claim-count',
  () => getRejectedClaimCountStub
)

const getDashboardData = require('../../../../app/services/data/dashboard/get-dashboard-data')

describe('services/data/dashboard/get-dashboard-data', function () {
  it('should call all of the relevant functions', function () {
    const testFilter = 'test filter'
    return getDashboardData(testFilter)
      .then(function (result) {
        expect(getAutoApprovedClaimCountStub.calledWith(testFilter)).toBe(true) //eslint-disable-line
        expect(getInProgressClaimCountStub.calledWith(testFilter)).toBe(true) //eslint-disable-line
        expect(getManuallyApprovedClaimCountStub.calledWith(testFilter)).toBe(true) //eslint-disable-line
        expect(getPaidClaimCountStub.calledWith(testFilter)).toBe(true) //eslint-disable-line
        expect(getPendingClaimCountStub.calledWith(testFilter)).toBe(true) //eslint-disable-line
        expect(getRejectedClaimCountStub.calledWith(testFilter)).toBe(true) //eslint-disable-line

        expect(getAutoApprovedClaimCountStub).toHaveBeenCalledTimes(1) //eslint-disable-line
        expect(getInProgressClaimCountStub).toHaveBeenCalledTimes(1) //eslint-disable-line
        expect(getManuallyApprovedClaimCountStub).toHaveBeenCalledTimes(1) //eslint-disable-line
        expect(getPaidClaimCountStub).toHaveBeenCalledTimes(1) //eslint-disable-line
        expect(getPendingClaimCountStub).toHaveBeenCalledTimes(1) //eslint-disable-line
        expect(getRejectedClaimCountStub).toHaveBeenCalledTimes(1) //eslint-disable-line
      })
  })

  it('should return a valid object', function () {
    const testFilter = 'test filter'
    return getDashboardData(testFilter)
      .then(function (dashboardData) {
        expect(dashboardData.autoApproved).toBeDefined() //eslint-disable-line
        expect(dashboardData.inProgress).toBeDefined() //eslint-disable-line
        expect(dashboardData.manuallyApproved).toBeDefined() //eslint-disable-line
        expect(dashboardData.paid).toBeDefined() //eslint-disable-line
        expect(dashboardData.pending).toBeDefined() //eslint-disable-line
        expect(dashboardData.rejected).toBeDefined() //eslint-disable-line
      })
  })
})
