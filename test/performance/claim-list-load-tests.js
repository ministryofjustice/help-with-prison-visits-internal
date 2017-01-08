const perfTestHelper = require('../helpers/performance-test-helper')

describe('Test performance of claim list queries under a known high load', () => {
  before(function () {
    return perfTestHelper.deleteAll()
      .then(function () {
        return perfTestHelper.insertTestDataBatch('NEW')
      })
  })

  it('should run the pre-reqs', function () {
    console.log('top kek')
  })

  after(function () {
  })
})
