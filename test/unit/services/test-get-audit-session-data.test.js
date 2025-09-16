const getAuditSessionData = require('../../../app/services/get-audit-session-data')

describe('services/add-audit-session-data', () => {
  it('should return value of given property from audit object exist in session', () => {
    const req = {
      session: {
        audit: {
          test: 'value',
        },
      },
    }

    expect(getAuditSessionData(req, 'test')).toBe('value')
  })
})
