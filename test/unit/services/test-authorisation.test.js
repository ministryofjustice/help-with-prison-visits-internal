const authorisation = require('../../../app/services/authorisation')
const applicationRoles = require('../../../app/constants/application-roles-enum')

describe('services/authorisation', () => {
  describe('isAuthenticated', () => {
    it('should throw a 401 error if no user', () => {
      try {
        authorisation.isAuthenticated({})
        // should have throw error
        expect(false).toBe(true)
      } catch (error) {
        expect(error.status).toBe(401)
      }
    })
    it('should not throw a 401 error if user', () => {
      authorisation.isAuthenticated({ user: {} })
    })
  })

  describe(`hasRoles - ${applicationRoles.BAND_9}`, () => {
    it('should throw a 401 error if no user', () => {
      try {
        authorisation.hasRoles({})
        // should have throw error
        expect(false).toBe(true)
      } catch (error) {
        expect(error.status).toBe(401)
      }
    })
    it(`should throw a 403 error if user is not ${applicationRoles.BAND_9}`, () => {
      try {
        authorisation.hasRoles(
          {
            user: {
              roles: [
                applicationRoles.CLAIM_ENTRY_BAND_2,
                applicationRoles.CLAIM_PAYMENT_BAND_3,
                applicationRoles.CASEWORK_MANAGER_BAND_5,
                applicationRoles.HWPV_SSCL,
              ],
            },
          },
          [applicationRoles.BAND_9],
        )
        // should have throw error
        expect(false).toBe(true)
      } catch (error) {
        expect(error.status).toBe(403)
      }
    })
    it(`should not throw a 403 error if user is ${applicationRoles.BAND_9}`, () => {
      authorisation.hasRoles(
        {
          user: {
            roles: [
              applicationRoles.CLAIM_ENTRY_BAND_2,
              applicationRoles.CLAIM_PAYMENT_BAND_3,
              applicationRoles.CASEWORK_MANAGER_BAND_5,
              applicationRoles.BAND_9,
              applicationRoles.HWPV_SSCL,
            ],
          },
        },
        [applicationRoles.BAND_9],
      )
    })
  })

  describe(`hasRoles - ${applicationRoles.HWPV_SSCL}`, () => {
    it('should throw a 401 error if no user', () => {
      try {
        authorisation.hasRoles({}, [
          applicationRoles.CLAIM_ENTRY_BAND_2,
          applicationRoles.CLAIM_PAYMENT_BAND_3,
          applicationRoles.CASEWORK_MANAGER_BAND_5,
          applicationRoles.BAND_9,
          applicationRoles.HWPV_SSCL,
        ])
        // should have throw error
        expect(false).toBe(true)
      } catch (error) {
        expect(error.status).toBe(401)
      }
    })
    it(`should throw a 403 error if user is not ${applicationRoles.HWPV_SSCL}`, () => {
      try {
        authorisation.hasRoles(
          {
            user: {
              roles: [
                applicationRoles.CLAIM_ENTRY_BAND_2,
                applicationRoles.CLAIM_PAYMENT_BAND_3,
                applicationRoles.CASEWORK_MANAGER_BAND_5,
                applicationRoles.BAND_9,
              ],
            },
          },
          [applicationRoles.HWPV_SSCL],
        )
        // should have throw error
        expect(false).toBe(true)
      } catch (error) {
        expect(error.status).toBe(403)
      }
    })
    it(`should not throw a 403 error if user is ${applicationRoles.HWPV_SSCL}`, () => {
      authorisation.hasRoles(
        {
          user: {
            roles: [
              applicationRoles.CLAIM_ENTRY_BAND_2,
              applicationRoles.CLAIM_PAYMENT_BAND_3,
              applicationRoles.CASEWORK_MANAGER_BAND_5,
              applicationRoles.BAND_9,
              applicationRoles.HWPV_SSCL,
            ],
          },
        },
        [applicationRoles.HWPV_SSCL],
      )
    })
  })

  describe(`hasRoles - ${applicationRoles.CLAIM_ENTRY_BAND_2}`, () => {
    it('should throw a 401 error if no user', () => {
      try {
        authorisation.hasRoles({}, [
          applicationRoles.CLAIM_ENTRY_BAND_2,
          applicationRoles.CLAIM_PAYMENT_BAND_3,
          applicationRoles.CASEWORK_MANAGER_BAND_5,
          applicationRoles.BAND_9,
          applicationRoles.HWPV_SSCL,
        ])
        // should have throw error
        expect(false).toBe(true)
      } catch (error) {
        expect(error.status).toBe(401)
      }
    })
    it(`should throw a 403 error if user is not ${applicationRoles.CLAIM_ENTRY_BAND_2}`, () => {
      try {
        authorisation.hasRoles(
          {
            user: {
              roles: [
                applicationRoles.CLAIM_PAYMENT_BAND_3,
                applicationRoles.CASEWORK_MANAGER_BAND_5,
                applicationRoles.BAND_9,
                applicationRoles.HWPV_SSCL,
              ],
            },
          },
          [applicationRoles.CLAIM_ENTRY_BAND_2],
        )
        // should have throw error
        expect(false).toBe(true)
      } catch (error) {
        expect(error.status).toBe(403)
      }
    })
    it(`should not throw a 403 error if user is ${applicationRoles.CLAIM_ENTRY_BAND_2}`, () => {
      authorisation.hasRoles(
        {
          user: {
            roles: [
              applicationRoles.CLAIM_ENTRY_BAND_2,
              applicationRoles.CLAIM_PAYMENT_BAND_3,
              applicationRoles.CASEWORK_MANAGER_BAND_5,
              applicationRoles.BAND_9,
              applicationRoles.HWPV_SSCL,
            ],
          },
        },
        [applicationRoles.CLAIM_ENTRY_BAND_2],
      )
    })
  })

  describe(`hasRoles - ${applicationRoles.CLAIM_PAYMENT_BAND_3}`, () => {
    it('should throw a 401 error if no user', () => {
      try {
        authorisation.hasRoles({}, [
          applicationRoles.CLAIM_ENTRY_BAND_2,
          applicationRoles.CLAIM_PAYMENT_BAND_3,
          applicationRoles.CASEWORK_MANAGER_BAND_5,
          applicationRoles.BAND_9,
          applicationRoles.HWPV_SSCL,
        ])
        // should have throw error
        expect(false).toBe(true)
      } catch (error) {
        expect(error.status).toBe(401)
      }
    })
    it(`should throw a 403 error if user is not ${applicationRoles.CLAIM_PAYMENT_BAND_3}`, () => {
      try {
        authorisation.hasRoles(
          {
            user: {
              roles: [
                applicationRoles.CLAIM_ENTRY_BAND_2,
                applicationRoles.CASEWORK_MANAGER_BAND_5,
                applicationRoles.BAND_9,
                applicationRoles.HWPV_SSCL,
              ],
            },
          },
          [applicationRoles.CLAIM_PAYMENT_BAND_3],
        )
        // should have throw error
        expect(false).toBe(true)
      } catch (error) {
        expect(error.status).toBe(403)
      }
    })
    it(`should not throw a 403 error if user is ${applicationRoles.CLAIM_PAYMENT_BAND_3}`, () => {
      authorisation.hasRoles(
        {
          user: {
            roles: [
              applicationRoles.CLAIM_ENTRY_BAND_2,
              applicationRoles.CLAIM_PAYMENT_BAND_3,
              applicationRoles.CASEWORK_MANAGER_BAND_5,
              applicationRoles.BAND_9,
              applicationRoles.HWPV_SSCL,
            ],
          },
        },
        [applicationRoles.CLAIM_PAYMENT_BAND_3],
      )
    })
  })

  describe(`hasRoles - ${applicationRoles.CASEWORK_MANAGER_BAND_5}`, () => {
    it('should throw a 401 error if no user', () => {
      try {
        authorisation.hasRoles({}, [
          applicationRoles.CLAIM_ENTRY_BAND_2,
          applicationRoles.CLAIM_PAYMENT_BAND_3,
          applicationRoles.CASEWORK_MANAGER_BAND_5,
          applicationRoles.BAND_9,
          applicationRoles.HWPV_SSCL,
        ])
        // should have throw error
        expect(false).toBe(true)
      } catch (error) {
        expect(error.status).toBe(401)
      }
    })
    it(`should throw a 403 error if user is not ${applicationRoles.CASEWORK_MANAGER_BAND_5}`, () => {
      try {
        authorisation.hasRoles(
          {
            user: {
              roles: [
                applicationRoles.CLAIM_ENTRY_BAND_2,
                applicationRoles.CLAIM_PAYMENT_BAND_3,
                applicationRoles.BAND_9,
                applicationRoles.HWPV_SSCL,
              ],
            },
          },
          [applicationRoles.CASEWORK_MANAGER_BAND_5],
        )
        // should have throw error
        expect(false).toBe(true)
      } catch (error) {
        expect(error.status).toBe(403)
      }
    })
    it(`should not throw a 403 error if user is ${applicationRoles.CASEWORK_MANAGER_BAND_5}`, () => {
      authorisation.hasRoles(
        {
          user: {
            roles: [
              applicationRoles.CLAIM_ENTRY_BAND_2,
              applicationRoles.CLAIM_PAYMENT_BAND_3,
              applicationRoles.CASEWORK_MANAGER_BAND_5,
              applicationRoles.BAND_9,
              applicationRoles.HWPV_SSCL,
            ],
          },
        },
        [applicationRoles.CASEWORK_MANAGER_BAND_5],
      )
    })
  })
})
