const expect = require('chai').expect
const addAuditSessionData = require('../../../app/services/add-audit-session-data')

describe('services/add-audit-session-data', function () {
  it('should create audit object add given audit data to session when no audit object exist in session', function () {
    const req = {
      session: {}
    }
    addAuditSessionData(req, 'test', 'value')
    expect(req.session.audit.test).to.be.equal('value') //eslint-disable-line
  })

  it('should add given audit data to session when audit object already exist in session', function () {
    const req = {
      session: {
        audit: {}
      }
    }
    addAuditSessionData(req, 'test', 'value')
    expect(req.session.audit.test).to.be.equal('value') //eslint-disable-line
  })
})
