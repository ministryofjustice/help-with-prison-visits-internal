const expect = require('chai').expect
const authorisation = require('../../../app/services/authorisation')
const applicationRoles = require('../../../app/constants/application-roles-enum')

describe('services/authorisation', function () {
  describe('isAuthenticated', function () {
    it('should throw a 401 error if no user', function () {
      try {
        authorisation.isAuthenticated({})
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(401)
      }
    })
    it('should not throw a 401 error if user', function () {
      authorisation.isAuthenticated({ user: {} })
    })
  })

  describe('hasRoles - ' + applicationRoles.BAND_9, function () {
    it('should throw a 401 error if no user', function () {
      try {
        authorisation.hasRoles({})
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(401)
      }
    })
    it('should throw a 403 error if user is not ' + applicationRoles.BAND_9, function () {
      try {
        authorisation.hasRoles({ user: { roles: [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL] } }, [applicationRoles.BAND_9])
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(403)
      }
    })
    it('should not throw a 403 error if user is ' + applicationRoles.BAND_9, function () {
      authorisation.hasRoles({ user: { roles: [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL] } }, [applicationRoles.BAND_9])
    })
  })

  describe('hasRoles - ' + applicationRoles.HWPV_SSCL, function () {
    it('should throw a 401 error if no user', function () {
      try {
        authorisation.hasRoles({}, [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL])
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(401)
      }
    })
    it('should throw a 403 error if user is not ' + applicationRoles.HWPV_SSCL, function () {
      try {
        authorisation.hasRoles({ user: { roles: [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER] } }, [applicationRoles.HWPV_SSCL])
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(403)
      }
    })
    it('should not throw a 403 error if user is ' + applicationRoles.HWPV_SSCL, function () {
      authorisation.hasRoles({ user: { roles: [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL] } }, [applicationRoles.HWPV_SSCL])
    })
  })

  describe('hasRoles - ' + applicationRoles.CLAIM_ENTRY_BAND_2, function () {
    it('should throw a 401 error if no user', function () {
      try {
        authorisation.hasRoles({}, [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL])
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(401)
      }
    })
    it('should throw a 403 error if user is not ' + applicationRoles.CLAIM_ENTRY_BAND_2, function () {
      try {
        authorisation.hasRoles({ user: { roles: [applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL] } }, [applicationRoles.CLAIM_ENTRY_BAND_2])
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(403)
      }
    })
    it('should not throw a 403 error if user is ' + applicationRoles.CLAIM_ENTRY_BAND_2, function () {
      authorisation.hasRoles({ user: { roles: [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL] } }, [applicationRoles.CLAIM_ENTRY_BAND_2])
    })
  })

  describe('hasRoles - ' + applicationRoles.CLAIM_PAYMENT_BAND_3, function () {
    it('should throw a 401 error if no user', function () {
      try {
        authorisation.hasRoles({}, [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL])
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(401)
      }
    })
    it('should throw a 403 error if user is not ' + applicationRoles.CLAIM_PAYMENT_BAND_3, function () {
      try {
        authorisation.hasRoles({ user: { roles: [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL] } }, [applicationRoles.CLAIM_PAYMENT_BAND_3])
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(403)
      }
    })
    it('should not throw a 403 error if user is ' + applicationRoles.CLAIM_PAYMENT_BAND_3, function () {
      authorisation.hasRoles({ user: { roles: [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL] } }, [applicationRoles.CLAIM_PAYMENT_BAND_3])
    })
  })

  describe('hasRoles - ' + applicationRoles.CASEWORK_MANAGER_BAND_5, function () {
    it('should throw a 401 error if no user', function () {
      try {
        authorisation.hasRoles({}, [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL])
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(401)
      }
    })
    it('should throw a 403 error if user is not ' + applicationRoles.CASEWORK_MANAGER_BAND_5, function () {
      try {
        authorisation.hasRoles({ user: { roles: [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL] } }, [applicationRoles.CASEWORK_MANAGER_BAND_5])
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(403)
      }
    })
    it('should not throw a 403 error if user is ' + applicationRoles.CASEWORK_MANAGER_BAND_5, function () {
      authorisation.hasRoles({ user: { roles: [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL] } }, [applicationRoles.CASEWORK_MANAGER_BAND_5])
    })
  })

  describe('hasRoles - ' + applicationRoles.APPLICATION_DEVELOPER, function () {
    it('should throw a 401 error if no user', function () {
      try {
        authorisation.hasRoles({}, [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL])
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(401)
      }
    })
    it('should throw a 403 error if user is not ' + applicationRoles.APPLICATION_DEVELOPER, function () {
      try {
        authorisation.hasRoles({ user: { roles: [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.HWPV_SSCL] } }, [applicationRoles.APPLICATION_DEVELOPER])
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(403)
      }
    })
    it('should not throw a 403 error if user is ' + applicationRoles.APPLICATION_DEVELOPER, function () {
      authorisation.hasRoles({ user: { roles: [applicationRoles.CLAIM_ENTRY_BAND_2, applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5, applicationRoles.BAND_9, applicationRoles.APPLICATION_DEVELOPER, applicationRoles.HWPV_SSCL] } }, [applicationRoles.APPLICATION_DEVELOPER])
    })
  })
})
