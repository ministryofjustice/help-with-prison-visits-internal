var expect = require('chai').expect
var authorisation = require('../../../app/services/authorisation')

describe('services/authorisation', function () {
  describe('isAuthenticated', function () {
    it('should throw a 401 error if no user', function () {
      try {
        authorisation.isAuthenticated({})
        expect(false, 'should have throw error').to.be.true
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
        expect(false, 'should have throw error').to.be.true
      } catch (error) {
        expect(error.status).to.equal(401)
      }
    })
    it('should throw a 403 error if user is not admin', function () {
      try {
        authorisation.isAdmin({ user: { roles: ['caseworker'] } })
        expect(false, 'should have throw error').to.be.true
      } catch (error) {
        expect(error.status).to.equal(403)
      }
    })
    it('should not throw a 403 error if user is admin', function () {
      authorisation.isAdmin({ user: { roles: ['caseworker', 'admin'] } })
    })
  })
})
