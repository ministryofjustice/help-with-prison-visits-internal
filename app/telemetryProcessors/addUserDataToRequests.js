const appInsights = require('applicationinsights')

module.exports = function addUserDataToRequests (envelope, contextObjects) {
  const isRequest = envelope.data.baseType === appInsights.Contracts.TelemetryTypeString.Request
  if (isRequest) {
    const { username, activeCaseLoadId } = contextObjects?.['http.ServerRequest']?.req?.user || {}
    console.log(contextObjects['http.ServerRequest'].res)
    if (username) {
      const { properties } = envelope.data.baseData
      // eslint-disable-next-line no-param-reassign
      envelope.data.baseData.properties = {
        username,
        activeCaseLoadId,
        ...properties
      }
    }
  }
  return true
}
