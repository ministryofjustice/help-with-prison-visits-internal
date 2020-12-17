const UpdateContactDetailsResponse = require('../../../../app/services/domain/update-contact-details-response')
const ValidationError = require('../../../../app/services/errors/validation-error')
const expect = require('chai').expect
let updateContactDetailsResponse

describe('services/domain/update-contact-details-response', function () {
  const VALID_EMAIL_ADDRESS = 'no.one@none.com'
  const INVALID_EMAIL_ADDRESS = '12345678'
  const VALID_PHONE_NUMBER = '12345678'
  const INVALID_PHONE_NUMBER = '012345678901234567891'

  it('should construct a domain object given valid input', function () {
    updateContactDetailsResponse = new UpdateContactDetailsResponse(VALID_EMAIL_ADDRESS, VALID_PHONE_NUMBER)
    expect(updateContactDetailsResponse.emailAddress).to.equal(VALID_EMAIL_ADDRESS)
    expect(updateContactDetailsResponse.phoneNumber).to.equal(VALID_PHONE_NUMBER)
  })

  it('should throw validation error if email address is invalid', function () {
    try {
      updateContactDetailsResponse = new UpdateContactDetailsResponse(INVALID_EMAIL_ADDRESS, VALID_PHONE_NUMBER)
      expect.fail()
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors.EmailAddress).to.contain('Email address must have valid format')
    }
  })

  it('should throw validation error if email address is empty', function () {
    try {
      updateContactDetailsResponse = new UpdateContactDetailsResponse('', VALID_PHONE_NUMBER)
      expect.fail()
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors.EmailAddress).to.contain('Email address is required')
    }
  })

  it('should throw validation error if phone number is invalid', function () {
    try {
      updateContactDetailsResponse = new UpdateContactDetailsResponse(VALID_EMAIL_ADDRESS, INVALID_PHONE_NUMBER)
      expect.fail()
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors.PhoneNumber).to.contain('Phone number must be 20 characters or shorter')
    }
  })
})
