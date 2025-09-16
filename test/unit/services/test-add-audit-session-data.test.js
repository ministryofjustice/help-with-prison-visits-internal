const addAuditSessionData = require('../../../app/services/add-audit-session-data')

describe('services/add-audit-session-data', () => {
  it('should create audit object add given audit data to session when no audit object exist in session', () => {
    const req = {
      session: {},
    }
    addAuditSessionData(req, 'test', 'value')
    expect(req.session.audit.test).toBe('value')
  })

  it('should add given audit data to session when audit object already exist in session', () => {
    const req = {
      session: {
        audit: {},
      },
    }
    addAuditSessionData(req, 'test', 'value')
    expect(req.session.audit.test).toBe('value')
  })
})
