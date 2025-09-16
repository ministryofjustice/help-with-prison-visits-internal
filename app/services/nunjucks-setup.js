const path = require('path')
const nunjucks = require('nunjucks')

module.exports = (app, developmentMode) => {
  const appViews = [
    'node_modules/govuk-frontend/dist/',
    'node_modules/@ministryofjustice/frontend/',
    'node_modules/@ministryofjustice/frontend/moj/components/',
    path.join(__dirname, '../views'),
  ]

  // View Engine Configuration
  app.set('view engine', 'html')
  const njkEnv = nunjucks.configure(appViews, {
    express: app,
    autoescape: true,
    watch: developmentMode,
    noCache: developmentMode,
  })

  njkEnv.addFilter('concat', (arr1, arr2) => {
    return arr1.concat(arr2)
  })

  njkEnv.addFilter('tableTitle', active => {
    if (!active) {
      return 'New'
    }
    if (active === 'ADVANCE-APPROVED') {
      return 'Advance pending'
    }
    if (active === 'ADVANCE-PENDING-INFORMATION') {
      return 'Advance awaiting information'
    }
    return active
  })

  njkEnv.addFilter('removeDashes', str => {
    if (typeof str === 'string') {
      return str.replace(/-/g, ' ')
    }
    return str
  })

  const getMojFilters = require('@ministryofjustice/frontend/moj/filters/all')

  const mojFilters = getMojFilters()
  Object.keys(mojFilters).forEach(filterName => {
    njkEnv.addFilter(filterName, mojFilters[filterName])
  })

  // convert errors to format for GOV.UK error summary component
  njkEnv.addFilter('errorSummaryList', (errors = []) => {
    return Object.keys(errors).map(error => {
      const errorListItem = {}
      ;[errorListItem.text] = errors[error]
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
        text: errors[formFieldId][0],
      }
    }
    return null
  })
}
