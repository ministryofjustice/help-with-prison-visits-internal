const Claim = require('../../services/data/get-individual-claim-details')
const moment = require('moment')

module.exports = function (router) {
  router.get('/claim/:ClaimID', function (req, res) {
    Claim.get(req.params.ClaimID)
      .then(function (data) {
        data.DateSubmitted = moment(data.DateSubmitted).format('DD-MM-YYYY')
        data.DateOfBirth = moment(data.DateOfBirth).format('DD-MM-YYYY')
        return res.render('./claim/view-claim', {
          title: 'APVS Claim',
          Claim: data,
          temp: {
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
  })
}
