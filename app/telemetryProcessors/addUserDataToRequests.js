const appInsights = require('applicationinsights')

module.exports = function addUserDataToRequests(envelope, contextObjects) {
  const isRequest = envelope.data.baseType === appInsights.Contracts.TelemetryTypeString.Request
  if (isRequest) {
    const { username, activeCaseLoadId } = contextObjects?.['http.ServerRequest']?.res?.locals?.user || {}

    if (username) {
      const { properties } = envelope.data.baseData

      envelope.data.baseData.properties = {
        username,
        activeCaseLoadId,
        ...properties,
      }
    }
  }
  return true
}
