const getAuditSessionData = require('../../../app/services/get-audit-session-data')

describe('services/add-audit-session-data', function () {
  it('should return value of given property from audit object exist in session', function () {
    const req = {
      session: {
        audit: {
          test: 'value'
        }
      }
    }

    expect(getAuditSessionData(req, 'test')).toBe('value') //eslint-disable-line
  })
})
