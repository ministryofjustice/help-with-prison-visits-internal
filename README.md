# apvs-internal-web

[![Build Status](https://travis-ci.org/ministryofjustice/apvs-internal-web.svg?branch=develop)](https://travis-ci.org/ministryofjustice/apvs-internal-web?branch=develop) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![NSP Status](https://nodesecurity.io/orgs/ministry-of-justice-digital/projects/92b355c7-1691-4c4d-8d3a-80a95d0cccef/badge)](https://nodesecurity.io/orgs/ministry-of-justice-digital/projects/92b355c7-1691-4c4d-8d3a-80a95d0cccef)

Beta implementation of the Assisted Prison Visits Scheme internal web application.

## Requirements

* Docker (Including Docker Compose)
* Node 12 (Including NPM) - If running locally

## Run

### Locally
Install dependencies and run on port 3001.

```
npm install
npm start
```

### With Docker Compose
This will run the Internal Web application in development mode.

```
docker-compose build
docker-compose up
```

### Heroku

The application can be deployed to [heroku](https://www.heroku.com/) for quick preview.

```
heroku login
heroku create
heroku buildpacks:set heroku/nodejs

# Set config vars for application
# heroku config:set DB_USERNAME=mydbuser

git push heroku master
```

## Test

```
npm test                        # checks code against standard JS and runs mocha unit tests.
npm run-script test-coverage    # unit tests and generates code coverage using nyc
npm run-script test-unit        # unit tests
npm run-script test-integration # integration tests
npm run-script test-e2e         # e2e tests using selenium standalone against local
npm run-script test-e2e-smoke   # short smoke test using selenium standalone against local
```

Run e2e tests with [saucelabs](https://saucelabs.com)
```
# set environmental variables for saucelabs
export SAUCE_USERNAME='MY_USERNAME'
export SAUCE_ACCESS_KEY='MY_KEY'
export INT_WEB_TEST_BASEURL='http://localhost:3001' # proxy url for sauce connect

npm run-script test-e2e-ie8
npm run-script test-e2e-firefox
```

## Database

The application requires a MS SQL database instance, configured with an internal web user and a migration user. See [here](https://github.com/ministryofjustice/apvs/tree/develop/database) for details.

The External Web relies on table functions defined in the Internal Web application to access claim details that have already been submitted.

To run the [knex](http://knexjs.org/) database migrations:

```
npm run-script migrations
```

To rollback the last batch of changes:
```
npm run-script rollback
```

## Security

We are using [csurf](https://github.com/expressjs/csurf) for CSRF protection. All `POST` requests must have a valid CSRF token, which is added as a hidden input on HTML forms.

Use the following partial to add the hidden input:

```
{% include "partials/csrf-hidden-input.html" %}
```

## Maintenance page

You can start the application in maintenance mode, so it only displays a maintenance page for all requests.

```
npm run-script start-maintenance
```

## Notes

### Updating dependencies

This node application uses [npm shrinkwrap](https://docs.npmjs.com/cli/shrinkwrap) to fix dependencies and peer dependencies to specific versions. This prevents node modules from automatically updating on new releases without developers knowledge.

To manually update a dependency (e.g. GOV.UK styles) use `npm update my-dependency` and commit the updated `package.json` and `npm-shrinkwrap.json` files.

Please note, there is an outstanding [bug in npm](https://github.com/npm/npm/issues/14042) which attempts to install incompatible optional dependencies when referenced in shrinkwrap (`fsevents` is one). To prevent this, either update the dependency from inside a docker image or manually remove the dependency from `npm-shrinkwrap.json`.