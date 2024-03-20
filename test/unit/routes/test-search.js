// const routeHelper = require('../../helpers/routes/route-helper')
// const supertest = require('supertest')

// let mockGetClaimListForSearch
// let mockDisplayHelper
// let mockAuthorisation
// let mockHasRoles

// const RETURNED_CLAIM = {
//   Reference: 'SEARCH1',
//   FirstName: 'Joe',
//   LastName: 'Bloggs',
//   DateSubmitted: '2016-11-29T00:00:00.000Z',
//   ClaimType: 'first-time',
//   ClaimId: 1,
//   DateSubmittedFormatted: '28-11-2016 00:00',
//   Name: 'Joe Bloggs'
// }

// jest.mock('../../../app/services/authorisation', () => mockAuthorisation)
// jest.mock('../../../app/services/data/get-claim-list-for-search', () => mockGetClaimListForSearch)
// jest.mock('../../../app/views/helpers/display-helper', () => mockDisplayHelper)

// describe('routes/index', function () {
//   let app

//   beforeEach(function () {
//     mockHasRoles = jest.fn()
//     mockAuthorisation = { hasRoles: mockHasRoles }
//     mockGetClaimListForSearch = jest.fn()
//     mockDisplayHelper = sinon.stub({ getClaimTypeDisplayName: function () {} })
//     mockDisplayHelper.getClaimTypeDisplayName.mockReturnValue('First time')

//     const route = require('../../../app/routes/search')

//     app = routeHelper.buildApp(route)
//   })

//   describe('GET /search', function () {
//     it('should respond with a 200', function () {
//       return supertest(app)
//         .get('/search')
//         .expect(200)
//         .expect(function () {
//           expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
//         })
//     })
//   })

//   describe('GET /search-results', function () {
//     const draw = 1
//     const start = 0
//     const length = 10

//     it('should respond with a 200 and pass query string to data object', function () {
//       const searchQuery = 'Joe Bloggs'
//       mockGetClaimListForSearch.mockResolvedValue({ claims: [RETURNED_CLAIM], total: { Count: 1 } })
//       return supertest(app)
//         .get(`/search-results?q=${searchQuery}&draw=${draw}&start=${start}&length=${length}`)
//         .expect(200)
//         .expect(function (response) {
//           expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
//           expect(mockGetClaimListForSearch.toHaveBeenCalledWith(searchQuery, start, length)).toBe(true) //eslint-disable-line
//           expect(response.body.recordsTotal).toBe(1)
//           expect(response.body.claims[0].ClaimTypeDisplayName).toBe('First time')
//         })
//     })

//     it('should not call data object when provided an empty query', function () {
//       const searchQuery = ''
//       return supertest(app)
//         .get(`/search-results?q=${searchQuery}&draw=${draw}&start=${start}&length=${length}`)
//         .expect(200)
//         .expect(function (response) {
//           expect(mockGetClaimListForSearch).not.toHaveBeenCalled() //eslint-disable-line
//         })
//     })

//     it('should respond with a 500 promise rejects', function () {
//       const searchQuery = 'Joe Bloggs'
//       mockGetClaimListForSearch.mockRejectedValue()
//       return supertest(app)
//         .get(`/search-results?q=${searchQuery}&draw=${draw}&start=${start}&length=${length}`)
//         .expect(500)
//     })
//   })
// })
