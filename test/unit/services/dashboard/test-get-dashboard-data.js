const mockGetAutoApprovedClaimCount = jest.fn().mockResolvedValue([{ Count: 0 }])
const mockGetInProgressClaimCount = jest.fn().mockResolvedValue([{ Count: 0 }])
const mockGetManuallyApprovedClaimCount = jest.fn().mockResolvedValue([{ Count: 0 }])
const mockGetPaidClaimCount = jest.fn().mockResolvedValue([{ Count: 0 }])
const mockGetPendingClaimCount = jest.fn().mockResolvedValue([{ Count: 0 }])
const mockGetRejectedClaimCount = jest.fn().mockResolvedValue([{ Count: 0 }])

jest.mock(
  '../../../services/data/dashboard/get-auto-approved-claim-count',
  () => mockGetAutoApprovedClaimCount
)

jest.mock(
  '../../../services/data/dashboard/get-in-progress-claim-count',
  () => mockGetInProgressClaimCount
)

jest.mock(
  '../../../services/data/dashboard/get-manually-approved-claim-count',
  () => mockGetManuallyApprovedClaimCount
)

jest.mock(
  '../../../services/data/dashboard/get-paid-claim-count',
  () => mockGetPaidClaimCount
)

jest.mock(
  '../../../services/data/dashboard/get-pending-claim-count',
  () => mockGetPendingClaimCount
)

jest.mock(
  '../../../services/data/dashboard/get-rejected-claim-count',
  () => mockGetRejectedClaimCount
)

const getDashboardData = require('../../../../app/services/data/dashboard/get-dashboard-data')

describe('services/data/dashboard/get-dashboard-data', function () {
  it('should call all of the relevant functions', function () {
    const testFilter = 'test filter'
    return getDashboardData(testFilter)
      .then(function (result) {
        expect(mockGetAutoApprovedClaimCount.calledWith(testFilter)).toBe(true) //eslint-disable-line
        expect(mockGetInProgressClaimCount.calledWith(testFilter)).toBe(true) //eslint-disable-line
        expect(mockGetManuallyApprovedClaimCount.calledWith(testFilter)).toBe(true) //eslint-disable-line
        expect(mockGetPaidClaimCount.calledWith(testFilter)).toBe(true) //eslint-disable-line
        expect(mockGetPendingClaimCount.calledWith(testFilter)).toBe(true) //eslint-disable-line
        expect(mockGetRejectedClaimCount.calledWith(testFilter)).toBe(true) //eslint-disable-line

        expect(mockGetAutoApprovedClaimCount).toHaveBeenCalledTimes(1) //eslint-disable-line
        expect(mockGetInProgressClaimCount).toHaveBeenCalledTimes(1) //eslint-disable-line
        expect(mockGetManuallyApprovedClaimCount).toHaveBeenCalledTimes(1) //eslint-disable-line
        expect(mockGetPaidClaimCount).toHaveBeenCalledTimes(1) //eslint-disable-line
        expect(mockGetPendingClaimCount).toHaveBeenCalledTimes(1) //eslint-disable-line
        expect(mockGetRejectedClaimCount).toHaveBeenCalledTimes(1) //eslint-disable-line
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
