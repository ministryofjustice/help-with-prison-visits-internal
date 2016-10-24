module.exports = function (router) {
  router.get('/', function (req, res) {
    return res.render('index', {
      title: 'APVS index',
      claims: [
        {
          Reference: '1234567',
          FirstName: 'Bill',
          LastName: 'Bob',
          DateCreated: '12-12-2012',
          ClaimID: '123'
        },
        {
          Reference: '9876543',
          FirstName: 'Jill',
          LastName: 'Nill',
          DateCreated: '10-10-2010',
          ClaimID: '456'
        },
        {
          Reference: '18759308',
          FirstName: 'Blobby',
          LastName: 'Blob',
          DateCreated: '11-11-2011',
          ClaimID: '789'
        }
      ]
    })
  })
}
