const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const getAutoApprovedClaimCountStub = sinon.stub().resolves([{ Count: 0 }])
const getInProgressClaimCountStub = sinon.stub().resolves([{ Count: 0 }])
const getManuallyApprovedClaimCountStub = sinon.stub().resolves([{ Count: 0 }])
const getPaidClaimCountStub = sinon.stub().resolves([{ Count: 0 }])
const getPendingClaimCountStub = sinon.stub().resolves([{ Count: 0 }])
const getRejectedClaimCountStub = sinon.stub().resolves([{ Count: 0 }])

const getDashboardData = proxyquire('../../../../app/services/data/dashboard/get-dashboard-data', {
  '../../../services/data/dashboard/get-auto-approved-claim-count': getAutoApprovedClaimCountStub,
  '../../../services/data/dashboard/get-in-progress-claim-count': getInProgressClaimCountStub,
  '../../../services/data/dashboard/get-manually-approved-claim-count': getManuallyApprovedClaimCountStub,
  '../../../services/data/dashboard/get-paid-claim-count': getPaidClaimCountStub,
  '../../../services/data/dashboard/get-pending-claim-count': getPendingClaimCountStub,
  '../../../services/data/dashboard/get-rejected-claim-count': getRejectedClaimCountStub
})

describe('services/data/dashboard/get-dashboard-data', function () {
  it('should call all of the relevant functions', function () {
    const testFilter = 'test filter'
    return getDashboardData(testFilter)
      .then(function (result) {
        expect(getAutoApprovedClaimCountStub.calledWith(testFilter)).to.be.true //eslint-disable-line
        expect(getInProgressClaimCountStub.calledWith(testFilter)).to.be.true //eslint-disable-line
        expect(getManuallyApprovedClaimCountStub.calledWith(testFilter)).to.be.true //eslint-disable-line
        expect(getPaidClaimCountStub.calledWith(testFilter)).to.be.true //eslint-disable-line
        expect(getPendingClaimCountStub.calledWith(testFilter)).to.be.true //eslint-disable-line
        expect(getRejectedClaimCountStub.calledWith(testFilter)).to.be.true //eslint-disable-line

        expect(getAutoApprovedClaimCountStub.calledOnce).to.be.true //eslint-disable-line
        expect(getInProgressClaimCountStub.calledOnce).to.be.true //eslint-disable-line
        expect(getManuallyApprovedClaimCountStub.calledOnce).to.be.true //eslint-disable-line
        expect(getPaidClaimCountStub.calledOnce).to.be.true //eslint-disable-line
        expect(getPendingClaimCountStub.calledOnce).to.be.true //eslint-disable-line
        expect(getRejectedClaimCountStub.calledOnce).to.be.true //eslint-disable-line
      })
  })

  it('should return a valid object', function () {
    const testFilter = 'test filter'
    return getDashboardData(testFilter)
      .then(function (dashboardData) {
        expect(dashboardData.autoApproved).to.exist //eslint-disable-line
        expect(dashboardData.inProgress).to.exist //eslint-disable-line
        expect(dashboardData.manuallyApproved).to.exist //eslint-disable-line
        expect(dashboardData.paid).to.exist //eslint-disable-line
        expect(dashboardData.pending).to.exist //eslint-disable-line
        expect(dashboardData.rejected).to.exist //eslint-disable-line
      })
  })
})
