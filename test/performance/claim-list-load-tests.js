const perfTestHelper = require('../helpers/performance-test-helper')

const DEFAULT_CLAIM_LIST_SIZE = 500
const APPROVE_CLAIM_SIZE = 80000

describe('Test performance of claim list queries under a known high load', () => {
  before(function () {
    return perfTestHelper.deleteAll()
      .then(function () {
        return perfTestHelper.insertTestDataBatch('NEW', DEFAULT_CLAIM_LIST_SIZE, false, false)
      })
  })

  it('should run the pre-reqs', function () {
    console.log('top kek')
  })

  after(function () {
  })
})
