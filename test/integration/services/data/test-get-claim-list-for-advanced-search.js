/* eslint-disable no-prototype-builtins */
const { getClaimListForAdvancedSearch } = require('../../../../app/services/data/get-claim-list-for-advanced-search')
const dateFormatter = require('../../../../app/services/date-formatter')
const { getTestData, insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')
const { getClaimReference } = require('../../../helpers/integration')

const date = dateFormatter.build('10', '09', '2016') // set date in past so that is always at top of list returned
const reference1 = 'SQBUIL1'
const reference2 = 'SQBUIL2'
let claimId
let testData
let name
let ninumber
let prisonerNumber
let prison

describe('services/data/get-claim-list-for-advanced-search', function () {
  beforeAll(function () {
    testData = getTestData(reference1, 'APPROVED')
    name = testData.Visitor.FirstName + ' ' + testData.Visitor.LastName
    ninumber = testData.Visitor.NationalInsuranceNumber
    prisonerNumber = testData.Prisoner.PrisonNumber
    prison = testData.Prisoner.NameOfPrison
    return insertTestData(reference1, date.toDate(), 'APPROVED')
      .then(function (ids) {
        claimId = ids.claimId
        return insertTestData(reference2, date.toDate(), 'REJECTED', date.toDate(), 10)
      })
      .then(function () {
        const reference1ClaimUpdate = db('Claim')
          .update({
            AssistedDigitalCaseworker: 'test@test.com',
            DateOfJourney: date.toDate(),
            DateReviewed: date.toDate(),
            PaymentAmount: '12',
            PaymentDate: date.add(5, 'days').toDate()
          })
          .where('Reference', reference1)
        const reference2ClaimUpdate = db('Claim')
          .update({
            DateReviewed: date.toDate()
          })
          .where('Reference', reference2)
        const visitorUpdate = db('Visitor')
          .update({
            FirstName: 'Ref2FirstName',
            LastName: 'Ref2LastName',
            NationalInsuranceNumber: 'Ref2NINum'
          })
          .where('Reference', reference2)
        const prisonerUpdate = db('Prisoner')
          .update({
            PrisonNumber: 'REF2PNO',
            NameOfPrison: 'Ref2Prison'
          })
          .where('Reference', reference2)
        const updates = []
        updates.push(reference1ClaimUpdate, reference2ClaimUpdate, visitorUpdate, prisonerUpdate)
        return Promise.all(updates)
      })
  })

  it('should return 0 claims given empty search criteria', function () {
    const searchCriteria = {}

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        // Claims length should equal 0
        expect(result.claims.length).toBe(0)
        // Total should equal 0
        expect(result.total).toBe(0)
      })
  })

  it('should return the correct claim given the reference number', function () {
    const searchCriteria = {
      reference: reference1
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        // Reference should equal ${reference1}
        expect(result.claims[0].Reference).toBe(reference1)
        // ClaimId should equal ${claimId}
        expect(result.claims[0].ClaimId).toBe(claimId)
        // Claims length should equal 1
        expect(result.claims.length).toBe(1)
        // Days Until Payment should equal 5
        expect(result.claims[0].DaysUntilPayment).toBe(5)
      })
  })

  it('should return "N/A" for days until payment if payment date is null', function () {
    const searchCriteria = {
      reference: reference2
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        // Days Until Payment should equal N/A
        expect(result.claims[0].DaysUntilPayment).toBe('N/A')
      })
  })

  it('should not return claims with the wrong reference number', function () {
    const searchCriteria = {
      reference: reference1
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference2 = getClaimReference(result, reference2)
        // Claims length should equal 1
        expect(claimsWithCurrentReference2.length).toBe(0)
      })
  })

  it('should return the correct claim given the name', function () {
    const searchCriteria = {
      name
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
        // Name should equal ${name}
        expect(claimsWithCurrentReference[0].Name).toBe(name)
      })
  })

  it('should return the correct claim given the first name only', function () {
    const searchCriteria = {
      name: testData.Visitor.FirstName
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong name', function () {
    const searchCriteria = {
      name
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithReference2 = getClaimReference(result, reference2)
        // Claims with reference2 length should equal 0
        expect(claimsWithReference2.length).toBe(0)
      })
  })

  it('should return the correct claim given the national insurance number', function () {
    const searchCriteria = {
      ninumber
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong national insurance number', function () {
    const searchCriteria = {
      ninumber
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithReference2 = getClaimReference(result, reference2)
        // Claims with reference2 length should equal 0
        expect(claimsWithReference2.length).toBe(0)
      })
  })

  it('should return the correct claim given the prisoner number', function () {
    const searchCriteria = {
      prisonerNumber
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong prisoner number', function () {
    const searchCriteria = {
      prisonerNumber
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithReference2 = getClaimReference(result, reference2)
        // Claims with reference2 length should equal 0
        expect(claimsWithReference2.length).toBe(0)
      })
  })

  it('should return the correct claim given the prison', function () {
    const searchCriteria = {
      prison
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong prison', function () {
    const searchCriteria = {
      prison
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithReference2 = getClaimReference(result, reference2)
        // Claims with reference2 length should equal 0
        expect(claimsWithReference2.length).toBe(0)
      })
  })

  it('should return the correct claim given the assisted digital field', function () {
    const searchCriteria = {
      assistedDigital: true
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong assisted digital value', function () {
    const searchCriteria = {}

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithReference2 = getClaimReference(result, reference2)
        // Claims with reference2 length should equal 0
        expect(claimsWithReference2.length).toBe(0)
      })
  })

  it('should return the correct claim given the claim status', function () {
    const searchCriteria = {
      claimStatus: 'APPROVED'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should return the correct claim given all claim statuses', function () {
    const searchCriteria = {
      claimStatus: 'all'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong claim status', function () {
    const searchCriteria = {
      claimStatus: 'PENDING'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithReference2 = getClaimReference(result, reference2)
        // Claims with reference2 length should equal 0
        expect(claimsWithReference2.length).toBe(0)
      })
  })

  it('should return the correct claim given the mode of approval', function () {
    const searchCriteria = {
      modeOfApproval: 'APPROVED'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong mode of approval', function () {
    const searchCriteria = {
      modeOfApproval: 'AUTOAPPROVED'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // Claims with current reference length should equal 0
        expect(claimsWithCurrentReference.length).toBe(0)
      })
  })

  it('should return the correct claim given whether the visit was in the past or future', function () {
    const searchCriteria = {
      pastOrFuture: 'past'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong value for past or future', function () {
    const searchCriteria = {
      pastOrFuture: 'future'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // Claims with current reference length should equal 0
        expect(claimsWithCurrentReference.length).toBe(0)
      })
  })

  it('should return the correct claim given the visit rules', function () {
    const searchCriteria = {
      visitRules: 'englandWales'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong value for visit rules', function () {
    const searchCriteria = {
      visitRules: 'northernIreland'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // Claims with current reference length should equal 0
        expect(claimsWithCurrentReference.length).toBe(0)
      })
  })

  it('should return the correct claim given the date of visit lower bound', function () {
    const visitDateFrom = dateFormatter.build('10', '09', '2016').subtract(1, 'day').toDate()
    const searchCriteria = {
      visitDateFrom
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong value for date of visit lower bound', function () {
    const visitDateFrom = dateFormatter.now().add(1, 'day').toDate()
    const searchCriteria = {
      visitDateFrom
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // Claims with current reference length should equal 0
        expect(claimsWithCurrentReference.length).toBe(0)
      })
  })

  it('should return the correct claim given the date of visit upper bound', function () {
    const visitDateTo = dateFormatter.now().add(1, 'day').toDate()
    const searchCriteria = {
      visitDateTo
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong value for date of visit upper bound', function () {
    const visitDateTo = dateFormatter.build('10', '09', '2016').subtract(1, 'day').toDate()
    const searchCriteria = {
      visitDateTo
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // Claims with current reference length should equal 0
        expect(claimsWithCurrentReference.length).toBe(0)
      })
  })

  it('should return the correct claim given the date submitted lower bound', function () {
    const dateSubmittedFrom = dateFormatter.build('10', '09', '2016').subtract(1, 'day').toDate()
    const searchCriteria = {
      dateSubmittedFrom
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong value for date submitted lower bound', function () {
    const dateSubmittedFrom = dateFormatter.now().add(1, 'day').toDate()
    const searchCriteria = {
      dateSubmittedFrom
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // Claims with current reference length should equal 0
        expect(claimsWithCurrentReference.length).toBe(0)
      })
  })

  it('should return the correct claim given the date submitted upper bound', function () {
    const dateSubmittedTo = dateFormatter.now().add(1, 'day').toDate()
    const searchCriteria = {
      dateSubmittedTo
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong value for date submitted upper bound', function () {
    const dateSubmittedTo = dateFormatter.build('10', '09', '2016').subtract(1, 'day').toDate()
    const searchCriteria = {
      dateSubmittedTo
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // Claims with current reference length should equal 0
        expect(claimsWithCurrentReference.length).toBe(0)
      })
  })

  it('should return the correct claim given the date approved lower bound', function () {
    const dateApprovedFrom = dateFormatter.build('10', '09', '2016').subtract(1, 'day').toDate()
    const searchCriteria = {
      dateApprovedFrom
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong value for date approved lower bound', function () {
    const dateApprovedFrom = dateFormatter.now().add(1, 'day').toDate()
    const searchCriteria = {
      dateApprovedFrom
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // Claims with current reference length should equal 0
        expect(claimsWithCurrentReference.length).toBe(0)
      })
  })

  it('should return the correct claim given the date approved upper bound', function () {
    const dateApprovedTo = dateFormatter.now().add(1, 'day').toDate()
    const searchCriteria = {
      dateApprovedTo
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithCurrentReference[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong value for date approved upper bound', function () {
    const dateApprovedTo = dateFormatter.build('10', '09', '2016').subtract(1, 'day').toDate()
    const searchCriteria = {
      dateApprovedTo
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // Claims with current reference length should equal 0
        expect(claimsWithCurrentReference.length).toBe(0)
      })
  })

  it('should return the correct claim given the date rejected lower bound', function () {
    const dateRejectedFrom = dateFormatter.build('10', '09', '2016').subtract(1, 'day').toDate()
    const searchCriteria = {
      dateRejectedFrom
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithReference2 = getClaimReference(result, reference2)
        // Claims with reference2 length should equal 1
        expect(claimsWithReference2.length).toBe(1)
      })
  })

  it('should not return claims with the wrong value for date rejected lower bound', function () {
    const dateRejectedFrom = dateFormatter.now().add(1, 'day').toDate()
    const searchCriteria = {
      dateRejectedFrom
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // Claims with current reference length should equal 0
        expect(claimsWithCurrentReference.length).toBe(0)
      })
  })

  it('should return the correct claim given the date rejected upper bound', function () {
    const dateRejectedTo = dateFormatter.now().add(1, 'day').toDate()
    const searchCriteria = {
      dateRejectedTo
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithReference2 = getClaimReference(result, reference2)
        // Claims with reference2 length should equal 1
        expect(claimsWithReference2.length).toBe(1)
      })
  })

  it('should not return claims with the wrong value for date rejected upper bound', function () {
    const dateRejectedTo = dateFormatter.build('10', '09', '2016').subtract(1, 'day').toDate()
    const searchCriteria = {
      dateRejectedTo
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithCurrentReference = getClaimReference(result, reference1)
        // Claims with current reference length should equal 0
        expect(claimsWithCurrentReference.length).toBe(0)
      })
  })

  it('should return the correct claim given the approved claim amount lower bound', function () {
    const approvedClaimAmountFrom = 10
    const searchCriteria = {
      approvedClaimAmountFrom
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithReference1 = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithReference1[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong value for approved claim amount lower bound', function () {
    const approvedClaimAmountFrom = 20
    const searchCriteria = {
      approvedClaimAmountFrom
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithReference1 = getClaimReference(result, reference1)
        // Claims with reference1 length should equal 0
        expect(claimsWithReference1.length).toBe(0)
      })
  })

  it('should return the correct claim given the approved claim amount upper bound', function () {
    const approvedClaimAmountTo = 20
    const searchCriteria = {
      approvedClaimAmountTo
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithReference1 = getClaimReference(result, reference1)
        // ClaimId should equal ${claimId}
        expect(claimsWithReference1[0].ClaimId).toBe(claimId)
      })
  })

  it('should not return claims with the wrong value for approved claim amount upper bound', function () {
    const approvedClaimAmountTo = 10
    const searchCriteria = {
      approvedClaimAmountTo
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        const claimsWithReference1 = getClaimReference(result, reference1)
        // Claims with reference1 length should equal 0
        expect(claimsWithReference1.length).toBe(0)
      })
  })

  it('should return the correct claim given multiple search criteria', function () {
    const searchCriteria = {
      reference: reference1,
      name,
      ninumber,
      prisonerNumber,
      prison,
      assistedDigital: true,
      claimStatus: 'APPROVED',
      modeOfApproval: 'APPROVED',
      pastOrFuture: 'past',
      visitRules: 'englandWales',
      visitDateFrom: dateFormatter.build('10', '09', '2016').subtract(1, 'day').toDate(),
      visitDateTo: dateFormatter.build('10', '09', '2016').add(1, 'day').toDate(),
      dateSubmittedFrom: dateFormatter.build('10', '09', '2016').subtract(1, 'day').toDate(),
      dateSubmittedTo: dateFormatter.build('10', '09', '2016').add(1, 'day').toDate(),
      dateApprovedFrom: dateFormatter.build('10', '09', '2016').subtract(1, 'day').toDate(),
      dateApprovedTo: dateFormatter.build('10', '09', '2016').add(1, 'day').toDate(),
      approvedClaimAmountFrom: '11.50',
      approvedClaimAmountTo: '13'
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10)
      .then(function (result) {
        // Reference should equal ${reference1}
        expect(result.claims[0].Reference).toBe(reference1)
        // ClaimId should equal ${claimId}
        expect(result.claims[0].ClaimId).toBe(claimId)
        // Claims length should equal 1
        expect(result.claims.length).toBe(1)
      })
  })

  it('should return the correct fields when returning export data', function () {
    const searchCriteria = {
      prison
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10, true)
      .then(function (result) {
        const claim = result.claims[0]

        expect(claim.hasOwnProperty('FirstName')).toBe(true)
        expect(claim.hasOwnProperty('LastName')).toBe(true)
        expect(claim.hasOwnProperty('Benefit')).toBe(true)
        expect(claim.hasOwnProperty('Relationship')).toBe(true)
        expect(claim.hasOwnProperty('DateSubmitted')).toBe(true)
        expect(claim.hasOwnProperty('DateOfJourney')).toBe(true)
        expect(claim.hasOwnProperty('DateReviewed')).toBe(true)
        expect(claim.hasOwnProperty('ClaimType')).toBe(true)
        expect(claim.hasOwnProperty('AssistedDigitalCaseworker')).toBe(true)
        expect(claim.hasOwnProperty('Caseworker')).toBe(true)
        expect(claim.hasOwnProperty('IsAdvanceClaim')).toBe(true)
        expect(claim.hasOwnProperty('Status')).toBe(true)
        expect(claim.hasOwnProperty('PaymentAmount')).toBe(true)
        expect(claim.hasOwnProperty('ClaimId')).toBe(true)
        expect(claim.hasOwnProperty('IsTrusted')).toBe(true)
        expect(claim.hasOwnProperty('NameOfPrison')).toBe(true)
        expect(claim.hasOwnProperty('PaymentMethod')).toBe(true)
      })
  })

  it('should return the correct fields when returning advanced search data', function () {
    const searchCriteria = {
      prison
    }

    return getClaimListForAdvancedSearch(searchCriteria, 0, 10, false)
      .then(function (result) {
        const claim = result.claims[0]

        expect(claim.hasOwnProperty('Reference')).toBe(true)
        expect(claim.hasOwnProperty('FirstName')).toBe(true)
        expect(claim.hasOwnProperty('LastName')).toBe(true)
        expect(claim.hasOwnProperty('DateSubmitted')).toBe(true)
        expect(claim.hasOwnProperty('DateOfJourney')).toBe(true)
        expect(claim.hasOwnProperty('ClaimType')).toBe(true)
        expect(claim.hasOwnProperty('ClaimId')).toBe(true)
      })
  })

  afterAll(function () {
    const promises = []

    promises.push(deleteAll(reference1))
    promises.push(deleteAll(reference2))

    return Promise.all(promises)
  })
})
