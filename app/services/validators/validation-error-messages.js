module.exports = {
  getIsRequired: function (displayName) { return `${displayName} is required` },
  getRadioQuestionIsRequired: function (displayName) { return `Select a ${displayName}` },
  getIsNumeric: function (displayName) { return `${displayName} must only contain numbers` },
  getDropboxIsRequired: function (displayName) { return `${displayName} is required` },
  getIsCurrency: function (displayName) { return `${displayName} must be a valid currency` },
  getIsGreaterThan: function (displayName) { return `${displayName} must be greater than zero` },
  getIsGreaterThanOrEqualTo: function (displayName) { return `${displayName} must be greater than or equal to zero` },
  getAssistedDigitalCaseworkerSameClaim: 'You cannot process this claim since you filled it in on behalf of a visitor',
  getUploadTooLarge: 'File uploaded too large',
  getUploadIncorrectType: 'File uploaded was not an image or pdf',
  getUpdateConflict: function (currentStatus) { return `This record has been updated since you started viewing it, its current status is ${currentStatus}` },
  getIsLessThanMaximumDifferentApprovedAmount: function (displayName) { return `${displayName} can only be £250 or less` },
  getNonRejectedClaimExpenseResponse: 'At least one expense must not be rejected for the claim to be approved'
}
