# apvs-internal-web

[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Beta implementation of the Assisted Prison Visits Scheme internal web application.

## Requirements

* Docker (Including Docker Compose)
* Node 6 (Including NPM) - If running locally

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

## Test

```
npm test                        # checks code against standard JS and runs mocha unit tests.
npm run-script test-coverage    # unit tests and generates code coverage using Istanbul
npm run-script test-unit        # unit tests
npm run-script test-integration # integration tests
npm run-script test-e2e         # e2e tests using selenium standalone against local
```

Run e2e tests with [saucelabs](https://saucelabs.com)
```
# set environmental variables for saucelabs
export SAUCE_USERNAME='MY_USERNAME'
export SAUCE_ACCESS_KEY='MY_KEY'
export SAUCE_BASEURL='http://localhost:3000' # proxy url for sauce connect

npm run-script test-e2e-ie8
npm run-script test-e2e-firefox
```