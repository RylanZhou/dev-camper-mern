/**
 * @description Log request url to console
 */
const logger = (request, response, next) => {
  // console.log(
  //   `${request.method} ${request.protocol}://${request.get('host')}${
  //     request.originalUrl
  //   }`
  // )
  console.log()
  console.log('➡️', '-'.bold.repeat(100))
  next()
}

module.exports = logger
