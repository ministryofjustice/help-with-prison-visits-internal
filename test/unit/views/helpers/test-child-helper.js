const expect = require('chai').expect
const getChildHelper = require('../../../../app/views/helpers/child-helper')
const childRelationshipEnum = require('../../../../app/constants/child-relationship-enum')

describe('views/helpers/child-helper', function () {
  const VISITORS_CHILD = childRelationshipEnum['claimants-child']
  const PRISONERS_CHILD = childRelationshipEnum['prisoners-child']
  const NON_MATCHING = ''

  it(`should return the expected value when passed ${VISITORS_CHILD}`, function () {
    expect(getChildHelper(VISITORS_CHILD)).to.equal("Visitor's child")
  })

  it(`should return the expected value when passed ${PRISONERS_CHILD}`, function () {
    expect(getChildHelper(PRISONERS_CHILD)).to.equal("Prisoner's child")
  })

  it('should return the original input if passed a non-matching value', function () {
    expect(getChildHelper(NON_MATCHING)).to.equal(NON_MATCHING)
  })
})
