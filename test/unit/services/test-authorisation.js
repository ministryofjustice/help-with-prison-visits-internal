const expect = require('chai').expect
const authorisation = require('../../../app/services/authorisation')

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

  describe('isAdmin', function () {
    it('should throw a 401 error if no user', function () {
      try {
        authorisation.isAdmin({})
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(401)
      }
    })
    it('should throw a 403 error if user is not admin', function () {
      try {
        authorisation.isAdmin({ user: { roles: ['caseworker'] } })
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(403)
      }
    })
    it('should not throw a 403 error if user is admin', function () {
      authorisation.isAdmin({ user: { roles: ['caseworker', 'admin'] } })
    })
  })

  describe('isSscl', function () {
    it('should throw a 401 error if no user', function () {
      try {
        authorisation.isSscl({})
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(401)
      }
    })
    it('should throw a 403 error if user is not SSCL', function () {
      try {
        authorisation.isSscl({ user: { roles: ['caseworker'] } })
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(403)
      }
    })
    it('should not throw a 403 error if user is SSCL', function () {
      authorisation.isSscl({ user: { roles: ['sscl'] } })
    })
  })

  describe('isCaseworker', function () {
    it('should throw a 401 error if no user', function () {
      try {
        authorisation.isCaseworker({})
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(401)
      }
    })
    it('should throw a 403 error if user is not caseworker', function () {
      try {
        authorisation.isCaseworker({ user: { roles: ['sscl'] } })
        expect(false, 'should have throw error').to.be.true //eslint-disable-line
      } catch (error) {
        expect(error.status).to.equal(403)
      }
    })
    it('should not throw a 403 error if user is caseworker', function () {
      authorisation.isCaseworker({ user: { roles: ['caseworker'] } })
    })
  })
})
