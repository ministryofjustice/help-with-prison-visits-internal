const expect = require('chai').expect
const sinon = require('sinon')
require('sinon-bluebird')
const proxyquire = require('proxyquire')

var getAutoApprovedClaimCountStub = sinon.stub().resolves([{ Count: 0 }])
var getInProgressClaimCountStub = sinon.stub().resolves([{ Count: 0 }])
var getManuallyApprovedClaimCountStub = sinon.stub().resolves([{ Count: 0 }])
var getPaidClaimCountStub = sinon.stub().resolves([{ Count: 0 }])
var getPendingClaimCountStub = sinon.stub().resolves([{ Count: 0 }])
var getRejectedClaimCountStub = sinon.stub().resolves([{ Count: 0 }])

var getDashboardData = proxyquire('../../../../app/services/data/dashboard/get-dashboard-data', {
  '../../../services/data/dashboard/get-auto-approved-claim-count': getAutoApprovedClaimCountStub,
  '../../../services/data/dashboard/get-in-progress-claim-count': getInProgressClaimCountStub,
  '../../../services/data/dashboard/get-manually-approved-claim-count': getManuallyApprovedClaimCountStub,
  '../../../services/data/dashboard/get-paid-claim-count': getPaidClaimCountStub,
  '../../../services/data/dashboard/get-pending-claim-count': getPendingClaimCountStub,
  '../../../services/data/dashboard/get-rejected-claim-count': getRejectedClaimCountStub
})

describe('services/data/dashboard/get-dashboard-data', function () {
  it('should call all of the relevant functions', function () {
    var testFilter = 'test filter'
    return getDashboardData(testFilter)
      .then(function (result) {
        expect(getAutoApprovedClaimCountStub.calledWith(testFilter)).to.be.true
        expect(getInProgressClaimCountStub.calledWith(testFilter)).to.be.true
        expect(getManuallyApprovedClaimCountStub.calledWith(testFilter)).to.be.true
        expect(getPaidClaimCountStub.calledWith(testFilter)).to.be.true
        expect(getPendingClaimCountStub.calledWith(testFilter)).to.be.true
        expect(getRejectedClaimCountStub.calledWith(testFilter)).to.be.true

        expect(getAutoApprovedClaimCountStub.calledOnce).to.be.true
        expect(getInProgressClaimCountStub.calledOnce).to.be.true
        expect(getManuallyApprovedClaimCountStub.calledOnce).to.be.true
        expect(getPaidClaimCountStub.calledOnce).to.be.true
        expect(getPendingClaimCountStub.calledOnce).to.be.true
        expect(getRejectedClaimCountStub.calledOnce).to.be.true
      })
  })

  it('should return a valid object', function () {
    var testFilter = 'test filter'
    return getDashboardData(testFilter)
      .then(function (dashboardData) {
        expect(dashboardData.autoApproved).to.exist
        expect(dashboardData.inProgress).to.exist
        expect(dashboardData.manuallyApproved).to.exist
        expect(dashboardData.paid).to.exist
        expect(dashboardData.pending).to.exist
        expect(dashboardData.rejected).to.exist
      })
  })
})
