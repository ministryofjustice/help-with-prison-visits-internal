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

  const getMojFilters = require('@ministryofjustice/frontend/moj/filters/all')

  const mojFilters = getMojFilters()
  Object.keys(mojFilters).forEach(filterName => {
    njkEnv.addFilter(filterName, mojFilters[filterName])
  })

  // convert errors to format for GOV.UK error summary component
  njkEnv.addFilter('errorSummaryList', (errors = []) => {
    return Object.keys(errors).map((error) => {
      const errorListItem = {}
      errorListItem.text = errors[error][0]
      if (error !== 'expired') {
        errorListItem.href = `#${error}`
      }
      return errorListItem
    })
  })

  // find specifc error and return errorMessage for field validation
  njkEnv.addFilter('findError', (errors, formFieldId) => {
    if (!errors || !formFieldId) return null
    if (errors[formFieldId]) {
      return {
        text: errors[formFieldId][0]
      }
    }
    return null
  })
}
