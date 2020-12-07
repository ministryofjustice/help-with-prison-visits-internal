const config = require('../../config')
const bunyan = require('bunyan')
const PrettyStream = require('bunyan-prettystream')

const logsPath = config.LOGGING_PATH || 'logs/internal-web.log'
const logsLevel = config.LOGGING_LEVEL

// Stream to handle pretty printing of Bunyan logs to stdout.
const prettyStream = new PrettyStream()
prettyStream.pipe(process.stdout)

// Create a base logger for the application.
const log = bunyan.createLogger({
  name: 'internal-web',
  streams: [],
  serializers: {
    request: requestSerializer,
    response: responseSerializer,
    error: errorSerializer,
    user: userSerializer
  }
})

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
