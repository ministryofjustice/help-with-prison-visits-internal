module.exports = function (router) {
  router.get('/claim/:ClaimID', function (req, res) {
    return res.render('./claim/view-claim', {
      title: 'APVS Claim',
      Claim: {
        Reference: '1234567',
        DateCreated: '12-12-2012',
        LastUpdated: '01-02-2013',
        FirstName: 'Bill',
        LastName: 'Bob',
        DateOfBirth: '13-06-1990',
        NationalInsuranceNumber: 'AA123456A',
        HouseNumberAndStreet: '13 Test Street',
        Town: 'Town',
        County: 'County',
        PostCode: 'PostCode',
        EmailAddress: 'test@test.com',
        PhoneNumber: '07763719283',
        Relationship: 'Sibling',
        Prison: 'Featherstone',
        PrisonerNumber: '00000001',
        PrisonerFirstName: 'Bob',
        PrisonerLastName: 'Bob',
        Expense: [
          {
            TransportType: 'Taxi',
            From: 'Lisburn Road',
            To: 'Belfast Central',
            Cost: '8',
            Status: 'Approved'
          },
          {
            TransportType: 'Train',
            From: 'Belfast',
            To: 'Newry',
            Cost: '12',
            IsReturn: 'True',
            Status: ''

          },
          {
            ExpenseType: 'Light Refreshment',
            Cost: '5',
            Description: 'Lunch',
            Status: 'Approved'
          }
        ],
        Total: '25'
      }
    })
  })
}
