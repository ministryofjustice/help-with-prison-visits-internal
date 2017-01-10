const config = require('../../config')
const bunyan = require('bunyan')
const bunyanLogstash = require('bunyan-logstash-tcp')
const PrettyStream = require('bunyan-prettystream')

const logsPath = config.LOGGING_PATH || 'logs/internal-web.log'
const logsLevel = config.LOGGING_LEVEL
const logstashHost = config.LOGSTASH_HOST
const logstashPort = config.LOGSTASH_PORT

// Stream to handle pretty printing of Bunyan logs to stdout.
var prettyStream = new PrettyStream()
prettyStream.pipe(process.stdout)

// Create a base logger for the application.
var log = bunyan.createLogger({
  name: 'internal-web',
  streams: [],
  serializers: {
    'request': requestSerializer,
    'response': responseSerializer,
    'error': errorSerializer,
    'user': userSerializer
  }
})

// Add stream to push logs to Logstash for aggregation, reattempt connections indefinitely.
if (logstashHost && logstashPort) {
  var logstashStream = bunyanLogstash.createStream({
    host: logstashHost,
    port: logstashPort,
    max_connect_retries: 10,
    retry_interval: 1000 * 60
  }).on('error', console.log)

  log.addStream({
    type: 'raw',
    level: logsLevel,
    stream: logstashStream
  })
}

// Add console Stream.
log.addStream({
  level: 'DEBUG',
  stream: prettyStream
})

// Add file stream.
log.addStream({
  type: 'rotating-file',
  level: logsLevel,
  path: logsPath,
  period: '1d',
  count: 7
})

function requestSerializer (request) {
  return {
    url: request.url,
    method: request.method,
    params: request.params,
    user: request.user ? request.user.email : 'n/a'
  }
}

function responseSerializer (response) {
  return {
    statusCode: response.statusCode
  }
}

function errorSerializer (error) {
  return {
    message: error.message,
    name: error.name,
    status: error.status,
    stack: error.stack
  }
}

function userSerializer (user) {
  return user ? user.email : 'n/a'
}

module.exports = log
