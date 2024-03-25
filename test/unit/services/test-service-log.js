const log = require('../../../app/services/log')

describe('services/log', function () {
  describe('create logger', function () {
    it('should create a log called internal web', function () {
      expect(log.fields.name).toBe('internal-web')
    })
  })
})
