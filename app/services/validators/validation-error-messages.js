module.exports = {
  getIsRequired: function (displayName) { return `${displayName} is required` },
  getRadioQuestionIsRequired: function (displayName) { return `Select a ${displayName}` },
  getIsNumeric: function (displayName) { return `${displayName} must only contain numbers` },
  getDropboxIsRequired: function (displayName) { return `${displayName} is required` },
  getIsCurrency: function (displayName) { return `${displayName} must be a valid currency` },
  getIsGreaterThan: function (displayName) { return `${displayName} must be greater than zero` }
}
