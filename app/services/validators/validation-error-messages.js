module.exports = {
  getIsRequired(displayName) {
    return `${displayName} is required`
  },
  getRadioQuestionIsRequired(displayName) {
    return `Select a ${displayName}`
  },
  getIsNumeric(displayName) {
    return `${displayName} must only contain numbers`
  },
  getDropboxIsRequired(displayName) {
    return `${displayName} is required`
  },
  getIsCurrency(displayName) {
    return `${displayName} must be a valid currency`
  },
  getIsGreaterThan(displayName) {
    return `${displayName} must be greater than zero`
  },
  getIsGreaterThanOrEqualTo(displayName) {
    return `${displayName} must be greater than or equal to zero`
  },
  isGreaterThanMinimumClaim(displayName) {
    return `${displayName} must be greater than £0`
  },
  getAssistedDigitalCaseworkerSameClaim: 'You cannot process this claim since you filled it in on behalf of a visitor',
  getUploadTooLarge: 'File uploaded too large',
  getUploadIncorrectType: 'File uploaded was not an image or pdf',
  getUpdateConflict(currentStatus) {
    return `This record has been updated since you started viewing it, its current status is ${currentStatus}`
  },
  getIsLessThanMaximumDifferentApprovedAmount(displayName) {
    return `${displayName} can only be £250 or less`
  },
  getNonRejectedClaimExpenseResponse() {
    return 'At least one expense must not be rejected for the claim to be approved'
  },
  getBenefitCheckRequired() {
    return 'Decide if benefit check needed'
  },
  getPrisonerCheckRequired() {
    return 'Decide on prisoner check'
  },
  getExpenseCheckRequired() {
    return 'Decide on this expense'
  },
  getVisitConfirmationRequired() {
    return 'Decide on visit confirmation'
  },
  getAdditionalInformationRequired() {
    return 'More information needed'
  },
  getUserAssignmentConflict(user) {
    return `This claim has been assigned to ${user}`
  },
  getUserNotAssigned() {
    return 'You have not assigned yourself to this claim'
  },
  getIsValidFormat(displayName) {
    return `${displayName} must have valid format`
  },
  getIsLessThanLengthMessage(displayName, options) {
    return `${displayName} must be ${options.length} characters or shorter`
  },
  getIsIntegerFormat(displayName) {
    return `${displayName} must be a whole number`
  },
  getValueIsTooLarge(displayName) {
    return `${displayName} value is too large for this field`
  },
  getApprovedCostTooHigh(displayName, approvedCostLimit) {
    return `${displayName} must not be greater than £${approvedCostLimit}`
  },
  getInvalidDateFormatMessage(displayName) {
    return `${displayName} was invalid`
  },
  getFutureDateMessage(displayName) {
    return `${displayName} must be in the future`
  },
  getExpiryDateIsRequired() {
    return 'Please enter the benefit expiry date'
  },
  getReleaseDateIsRequired() {
    return 'Please enter the release date'
  },
  getLessOrEqualToHundred(displayName) {
    return `${displayName} must be less or equal to hundred`
  },
}
