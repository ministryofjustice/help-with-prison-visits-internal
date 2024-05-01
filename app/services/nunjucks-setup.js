const path = require('path')
const nunjucks = require('nunjucks')

module.exports = function (app, developmentMode) {
  const appViews = [
    path.join(__dirname, '../../node_modules/govuk-frontend/'),
    path.join(__dirname, '../../node_modules/govuk_template_jinja'),
    path.join(__dirname, '../../node_modules/@ministryofjustice/frontend/'),
    path.join(__dirname, '../views')
  ]

  // View Engine Configuration
  app.set('view engine', 'html')
  const njkEnv = nunjucks.configure(appViews, {
    express: app,
    autoescape: true,
    watch: developmentMode,
    noCache: developmentMode
  })

  njkEnv.addFilter('concat', function (arr1, arr2) {
    return arr1.concat(arr2)
  })
}
