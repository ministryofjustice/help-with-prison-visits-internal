module.exports = {
  getIsRequired: function (displayName) { return `${displayName} is required` },
  getRadioQuestionIsRequired: function (displayName) { return `Select a ${displayName}` },
  getIsNumeric: function (displayName) { return `${displayName} must only contain numbers` },
  getDropboxIsRequired: function (displayName) { return `${displayName} is required` },
  getIsCurrency: function (displayName) { return `${displayName} must be a valid currency` },
  getIsGreaterThan: function (displayName) { return `${displayName} must be greater than zero` },
  getIsGreaterThanOrEqualTo: function (displayName) { return `${displayName} must be greater than or equal to zero` },
  isGreaterThanMinimumClaim: function (displayName) { return `${displayName} must be greater than £0` },
  getAssistedDigitalCaseworkerSameClaim: 'You cannot process this claim since you filled it in on behalf of a visitor',
  getUploadTooLarge: 'File uploaded too large',
  getUploadIncorrectType: 'File uploaded was not an image or pdf',
  getUpdateConflict: function (currentStatus) { return `This record has been updated since you started viewing it, its current status is ${currentStatus}` },
  getIsLessThanMaximumDifferentApprovedAmount: function (displayName) { return `${displayName} can only be £250 or less` },
  getNonRejectedClaimExpenseResponse: function () { return 'At least one expense must not be rejected for the claim to be approved' },
  getBenefitCheckRequired: function () { return 'Decide if benefit check needed' },
  getPrisonerCheckRequired: function () { return 'Decide on prisoner check' },
  getExpenseCheckRequired: function () { return 'Decide on this expense' },
  getVisitConfirmationRequired: function () { return 'Decide on visit confirmation' },
  getAdditionalInformationRequired: function () { return 'More information needed' },
  getUserAssignmentConflict: function (user) { return `This claim has been assigned to ${user}` },
  getUserNotAssigned: function () { return 'You have not assigned yourself to this claim' },
  getIsValidFormat: function (displayName) { return `${displayName} must have valid format` },
  getIsLessThanLengthMessage: function (displayName, options) { return `${displayName} must be ${options.length} characters or shorter` },
  getIsIntegerFormat: function (displayName) { return `${displayName} must be a whole number` },
  getValueIsTooLarge: function (displayName) { return `${displayName} value is too large for this field` },
  getApprovedCostTooHigh: function (displayName, approvedCostLimit) { return `${displayName} must not be greater than £${approvedCostLimit}` },
  getInvalidDateFormatMessage: function (displayName) { return `${displayName} was invalid` },
  getFutureDateMessage: function (displayName) { return `${displayName} must be in the future` },
  getExpiryDateIsRequired: function () { return 'Please enter the benefit expiry date' },
  getReleaseDateIsRequired: function () { return 'Please enter the release date' },
  getLessOrEqualToHundred: function (displayName) { return `${displayName} must be less or equal to hundred` }
}
