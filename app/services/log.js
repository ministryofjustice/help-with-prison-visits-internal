const config = require('../../config')
const bunyan = require('bunyan')
const bunyanFormat = require('bunyan-format')
// const PrettyStream = require('bunyan-prettystream')

// const logsPath = config.LOGGING_PATH || 'logs/internal-web.log'
// const logsLevel = config.LOGGING_LEVEL

// // Stream to handle pretty printing of Bunyan logs to stdout.
// // const prettyStream = new PrettyStream()
// // prettyStream.pipe(process.stdout)

// // Create a base logger for the application.
// const log = bunyan.createLogger({
//   name: 'internal-web',
//   streams: [],
//   serializers: {
//     request: requestSerializer,
//     response: responseSerializer,
//     error: errorSerializer,
//     user: userSerializer
//   }
// })

// // Add console Stream.
// // log.addStream({
// //   level: 'DEBUG',
// //   stream: {
// //     level: "trace", // Priority of levels looks like this: Trace -> Debug -> Info -> Warn -> Error -> Fatal
// //     stream: process.stdout, // Developers will want to see this piped to their consoles
// //   }
// // })

// // Add file stream.
// log.addStream({
//   type: 'rotating-file',
//   level: logsLevel,
//   path: logsPath,
//   period: '1d',
//   count: 7
// })

// function requestSerializer (request) {
//   return {
//     url: request.url,
//     method: request.method,
//     params: request.params,
//     user: request.user ? request.user.email : 'n/a'
//   }
// }

// function responseSerializer (response) {
//   return {
//     statusCode: response.statusCode
//   }
// }

// function errorSerializer (error) {
//   return {
//     message: error.message,
//     name: error.name,
//     status: error.status,
//     stack: error.stack
//   }
// }

// function userSerializer (user) {
//   return user ? user.email : 'n/a'
// }


const formatOut = bunyanFormat({ outputMode: 'short', color: !config.production })

const log = bunyan.createLogger({ name: 'HwPV Internal', stream: formatOut, level: 'debug' })

module.exports = log
