// TODO: Will need to add check on each of the pages that has a constructed URL path.

describe('First time claim flow', () => {
  it('should display each page in the first time eligibility flow', () => {
    return browser.url('/')

      // Index
      .waitForExist('#temporary')
  })
})
