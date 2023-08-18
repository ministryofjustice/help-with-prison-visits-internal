const appInsights = require('applicationinsights')

module.exports = function addUserDataToRequests (envelope, contextObjects) {
  const isRequest = envelope.data.baseType === appInsights.Contracts.TelemetryTypeString.Request
  console.log(`isRequest:${isRequest}`)
  if (isRequest) {
    const { username, activeCaseLoadId } = contextObjects?.['http.ServerRequest']?.req?.user || {}
    console.log(JSON.stringify(contextObjects))
    console.log(JSON.stringify(contextObjects?.['http.ServerRequest']?.req))
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
