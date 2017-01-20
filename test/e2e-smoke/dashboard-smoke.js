describe('Smoke test', () => {
  it('should display the dashboard which calls the database', () => {
    return browser.url('/dashboard')

      // Dashboard
      .waitForExist('#dashboard')
  })
})
