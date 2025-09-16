const getChildHelper = require('../../../../app/views/helpers/child-helper')
const childRelationshipEnum = require('../../../../app/constants/child-relationship-enum')

describe('views/helpers/child-helper', () => {
  const VISITORS_CHILD = childRelationshipEnum['claimants-child']
  const PRISONERS_CHILD = childRelationshipEnum['prisoners-child']
  const NON_MATCHING = ''

  it(`should return the expected value when passed ${VISITORS_CHILD}`, () => {
    expect(getChildHelper(VISITORS_CHILD)).toBe("Visitor's child")
  })

  it(`should return the expected value when passed ${PRISONERS_CHILD}`, () => {
    expect(getChildHelper(PRISONERS_CHILD)).toBe("Prisoner's child")
  })

  it('should return the original input if passed a non-matching value', () => {
    expect(getChildHelper(NON_MATCHING)).toBe(NON_MATCHING)
  })
})
