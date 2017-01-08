const perfTestHelper = require('../helpers/performance-test-helper')

const DEFAULT_CLAIM_LIST_SIZE = 1000
const APPROVE_CLAIM_SIZE = 80000

describe('Test performance of claim list queries under a known high load', () => {
  before(function () {
    return perfTestHelper.deleteAll()
      .then(function () {
        return perfTestHelper.insertTestDataBatch('NEW', DEFAULT_CLAIM_LIST_SIZE)
      })
  })

  it('should run the pre-reqs', function () {
    console.log('top kek')
  })

  after(function () {
  })
})
