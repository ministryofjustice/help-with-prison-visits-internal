// const routeHelper = require('../../helpers/routes/route-helper')
// const supertest = require('supertest')
// const claimStatusEnum = require('../../../app/constants/claim-status-enum')

// let mockGetClaimsListAndCount
// let mockDisplayHelper
// let mockAuthorisation
// let mockHasRoles

// const RETURNED_CLAIM = {
//   Reference: 'A123456',
//   FirstName: 'Joe',
//   LastName: 'Bloggs',
//   DateSubmitted: '2016-11-29T00:00:00.000Z',
//   ClaimType: 'first-time',
//   ClaimId: 1,
//   DateSubmittedFormatted: '28-11-2016 00:00',
//   Name: 'Joe Bloggs'
// }

// jest.mock('../../../app/services/authorisation', () => mockAuthorisation)
// jest.mock('../../../app/services/data/get-claim-list-and-count', () => mockGetClaimsListAndCount)
// jest.mock('../../../app/views/helpers/display-helper', () => mockDisplayHelper)

// describe('routes/index', function () {
//   let app

//   beforeEach(function () {
//     mockHasRoles = jest.fn()
//     mockAuthorisation = { hasRoles: mockHasRoles }
//     mockGetClaimsListAndCount = jest.fn()
//     mockDisplayHelper = sinon.stub({ getClaimTypeDisplayName: function () {} })
//     mockDisplayHelper.getClaimTypeDisplayName.mockReturnValue('First time')

//     const route = require('../../../app/routes/index')

//     app = routeHelper.buildApp(route)
//   })

//   describe('GET /', function () {
//     it('should respond with a 200', function () {
//       return supertest(app)
//         .get('/')
//         .expect(200)
//         .expect(function () {
//           expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
//         })
//     })
//   })

//   describe('GET /claims/:status', function () {
//     it('should respond with a 200', function () {
//       mockGetClaimsListAndCount.mockResolvedValue({ claims: [RETURNED_CLAIM], total: { Count: 0 } })

//       return supertest(app)
//         .get('/claims/TEST?draw=1&start=0&length=10')
//         .expect(200)
//         .expect(function (response) {
//           expect(mockHasRoles).toHaveBeenCalledTimes(1) //eslint-disable-line
//           expect(mockGetClaimsListAndCount.calledWith(['TEST'], false, 0, 10)).toBe(true) //eslint-disable-line
//           expect(response.body.recordsTotal).toBe(0)
//           expect(response.body.claims[0].ClaimTypeDisplayName).toBe('First time')
//         })
//     })

//     it('should call for advance claims when status is ADVANCE', function () {
//       mockGetClaimsListAndCount.mockResolvedValue({ claims: [RETURNED_CLAIM], total: { Count: 0 } })

//       return supertest(app)
//         .get('/claims/ADVANCE?draw=1&start=0&length=10')
//         .expect(200)
//         .expect(function (response) {
//           expect(mockGetClaimsListAndCount.calledWith([claimStatusEnum.NEW.value], true, 0, 10)).toBe(true) //eslint-disable-line
//         })
//     })

//     it('should call for approved advance claims when status is ADVANCE-APPROVED', function () {
//       mockGetClaimsListAndCount.mockResolvedValue({ claims: [RETURNED_CLAIM], total: { Count: 0 } })

//       return supertest(app)
//         .get('/claims/ADVANCE-APPROVED?draw=1&start=0&length=10')
//         .expect(200)
//         .expect(function (response) {
//           expect(mockGetClaimsListAndCount.calledWith([claimStatusEnum.APPROVED.value], true, 0, 10)).toBe(true) //eslint-disable-line
//         })
//     })

//     it('should call for updated advance claims when status is ADVANCE-UPDATED', function () {
//       mockGetClaimsListAndCount.mockResolvedValue({ claims: [RETURNED_CLAIM], total: { Count: 0 } })

//       return supertest(app)
//         .get('/claims/ADVANCE-UPDATED?draw=1&start=0&length=10')
//         .expect(200)
//         .expect(function (response) {
//           expect(mockGetClaimsListAndCount.calledWith([claimStatusEnum.UPDATED.value], true, 0, 10)).toBe(true) //eslint-disable-line
//         })
//     })

//     it('should respond with a 500 promise rejects', function () {
//       mockGetClaimsListAndCount.mockRejectedValue()
//       return supertest(app)
//         .get('/claims/TEST?draw=1&start=0&length=10')
//         .expect(500)
//     })

//     afterEach(function () {
//       mockGetClaimsListAndCount.resetHistory()
//     })
//   })
// })
