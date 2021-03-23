const authorisation = require('../../services/authorisation')
const getIndividualClaimDetails = require('../../services/data/get-individual-claim-details')
const UpdateContactDetailsResponse = require('../../services/domain/update-contact-details-response')
const ValidationError = require('../../services/errors/validation-error')
const updateVisitorContactDetails = require('../../services/data/update-visitor-contact-details')
const applicationRoles = require('../../constants/application-roles-enum')
const allowedRoles = [
  applicationRoles.CLAIM_ENTRY_BAND_2,
  applicationRoles.CLAIM_PAYMENT_BAND_3,
  applicationRoles.CASEWORK_MANAGER_BAND_5
]

module.exports = function (router) {
  router.get('/claim/:claimId/update-contact-details', function (req, res, next) {
    authorisation.hasRoles(req, allowedRoles)

    return getIndividualClaimDetails(req.params.claimId)
      .then(function (data) {
        data.claim.PreviousEmailAddress = data.claim.EmailAddress
        data.claim.PreviousPhoneNumber = data.claim.PhoneNumber

        return res.render('claim/update-contact-details', {
          claimId: req.params.claimId,
          Claim: data.claim
        })
      })
      .catch(function (error) {
        next(error)
      })
  })

  router.post('/claim/:claimId/update-contact-details', function (req, res, next) {
    authorisation.hasRoles(req, allowedRoles)

    try {
      const updateContactDetailsResponse = new UpdateContactDetailsResponse(req.body.EmailAddress, req.body.PhoneNumber)

      return updateVisitorContactDetails(
        req.body.Reference,
        req.body.EligibilityId,
        req.params.claimId,
        updateContactDetailsResponse.emailAddress,
        updateContactDetailsResponse.phoneNumber,
        req.body.PreviousEmailAddress,
        req.body.PreviousPhoneNumber,
        req.user.email
      )
        .then(function () {
          return res.redirect(`/claim/${req.params.claimId}`)
        })
        .catch(function (error) {
          next(error)
        })
    } catch (error) {
      if (error instanceof ValidationError) {
        return getIndividualClaimDetails(req.params.claimId)
          .then(function (data) {
            data.claim.PreviousEmailAddress = data.claim.EmailAddress
            data.claim.PreviousPhoneNumber = data.claim.PhoneNumber
            data.claim.EmailAddress = req.body.EmailAddress
            data.claim.PhoneNumber = req.body.PhoneNumber

            return res.status(400).render('claim/update-contact-details', {
              errors: error.validationErrors,
              claimId: req.params.claimId,
              Claim: data.claim
            })
          })
          .catch(function (error) {
            next(error)
          })
      } else {
        throw error
      }
    }
  })
}
