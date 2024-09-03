const { getClaimsToReturn } = require('../../../../app/services/data/get-claim-list-for-advanced-search')

describe('services/data/get-claim-list-for-advanced-search', function () {
  it.each([
    [{
      DateSubmitted: '2024-01-02 13:33:00',
      DateOfJourney: '2024-01-01 00:00:00',
      Status: 'APPROVED',
      FirstName: 'FirstNameTest',
      LastName: 'LastNameTest',
      AssignedTo: '',
      AssignmentExpiry: '',
      PaymentDate: '2024-01-13 00:00:00'
    }, {
      DateSubmitted: '2024-01-02 13:33:00',
      DateSubmittedFormatted: '02/01/2024 - 13:33',
      DateOfJourney: '2024-01-01 00:00:00',
      DateOfJourneyFormatted: '01/01/2024',
      Status: 'APPROVED',
      DisplayStatus: 'Approved',
      FirstName: 'FirstNameTest',
      LastName: 'LastNameTest',
      Name: 'FirstNameTest LastNameTest',
      AssignedTo: 'Unassigned',
      AssignmentExpiry: '',
      PaymentDate: '2024-01-13 00:00:00',
      DaysUntilPayment: 10
    }]
  ])('getClaimsToReturn', (testClaim, expectedClaim) => {
    expect(getClaimsToReturn([], [testClaim], {}).claims[0]).toEqual(expectedClaim)
  })
})
