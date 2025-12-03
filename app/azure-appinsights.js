const appInsights = require('applicationinsights')
const applicationVersion = require('./application-version')
const ignoreNotFoundErrors = require('./telemetryProcessors/ignoreNotFound')
const addUserDataToRequests = require('./telemetryProcessors/addUserDataToRequests')

const { applicationName, buildNumber } = applicationVersion
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  // eslint-disable-next-line no-console
  console.log('Enabling azure application insights')
  appInsights.setup().setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C).start()
  module.exports = appInsights.defaultClient
  appInsights.defaultClient.context.tags['ai.cloud.role'] = applicationName
  appInsights.defaultClient.context.tags['ai.application.ver'] = buildNumber
  appInsights.defaultClient.addTelemetryProcessor(ignoreNotFoundErrors)
  appInsights.defaultClient.addTelemetryProcessor(addUserDataToRequests)
} else {
  module.exports = null
}
