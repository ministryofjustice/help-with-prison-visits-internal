const mockGetAutoApprovedClaimCount = jest.fn().mockResolvedValue([{ Count: 0 }])
const mockGetInProgressClaimCount = jest.fn().mockResolvedValue([{ Count: 0 }])
const mockGetManuallyApprovedClaimCount = jest.fn().mockResolvedValue([{ Count: 0 }])
const mockGetPaidClaimCount = jest.fn().mockResolvedValue([{ Count: 0 }])
const mockGetPendingClaimCount = jest.fn().mockResolvedValue([{ Count: 0 }])
const mockGetRejectedClaimCount = jest.fn().mockResolvedValue([{ Count: 0 }])

jest.mock(
  '../../../../app/services/data/dashboard/get-auto-approved-claim-count',
  () => mockGetAutoApprovedClaimCount
)

jest.mock(
  '../../../../app/services/data/dashboard/get-in-progress-claim-count',
  () => mockGetInProgressClaimCount
)

jest.mock(
  '../../../../app/services/data/dashboard/get-manually-approved-claim-count',
  () => mockGetManuallyApprovedClaimCount
)

jest.mock(
  '../../../../app/services/data/dashboard/get-paid-claim-count',
  () => mockGetPaidClaimCount
)

jest.mock(
  '../../../../app/services/data/dashboard/get-pending-claim-count',
  () => mockGetPendingClaimCount
)

jest.mock(
  '../../../../app/services/data/dashboard/get-rejected-claim-count',
  () => mockGetRejectedClaimCount
)

const getDashboardData = require('../../../../app/services/data/dashboard/get-dashboard-data')

describe('services/data/dashboard/get-dashboard-data', function () {
  it('should call all of the relevant functions', function () {
    const testFilter = 'test filter'
    return getDashboardData(testFilter)
      .then(function (result) {
        expect(mockGetAutoApprovedClaimCount).toHaveBeenCalledWith(testFilter)
        expect(mockGetInProgressClaimCount).toHaveBeenCalledWith(testFilter)
        expect(mockGetManuallyApprovedClaimCount).toHaveBeenCalledWith(testFilter)
        expect(mockGetPaidClaimCount).toHaveBeenCalledWith(testFilter)
        expect(mockGetPendingClaimCount).toHaveBeenCalledWith(testFilter)
        expect(mockGetRejectedClaimCount).toHaveBeenCalledWith(testFilter)

        expect(mockGetAutoApprovedClaimCount).toHaveBeenCalledTimes(1)
        expect(mockGetInProgressClaimCount).toHaveBeenCalledTimes(1)
        expect(mockGetManuallyApprovedClaimCount).toHaveBeenCalledTimes(1)
        expect(mockGetPaidClaimCount).toHaveBeenCalledTimes(1)
        expect(mockGetPendingClaimCount).toHaveBeenCalledTimes(1)
        expect(mockGetRejectedClaimCount).toHaveBeenCalledTimes(1)
      })
  })

  it('should return a valid object', function () {
    const testFilter = 'test filter'
    return getDashboardData(testFilter)
      .then(function (dashboardData) {
        expect(dashboardData.autoApproved).toBeDefined()
        expect(dashboardData.inProgress).toBeDefined()
        expect(dashboardData.manuallyApproved).toBeDefined()
        expect(dashboardData.paid).toBeDefined()
        expect(dashboardData.pending).toBeDefined()
        expect(dashboardData.rejected).toBeDefined()
      })
  })
})
