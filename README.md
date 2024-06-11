# Help with Prison Visits (HwPV) Internal/Staff

[![ministryofjustice](https://circleci.com/gh/ministryofjustice/help-with-prison-visits-internal.svg?style=svg)](https://circleci.com/gh/ministryofjustice/help-with-prison-visits-internal) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Help With Prison Visits internal, staff facing web application. This app sits behind [HMPPS Auth](https://github.com/ministryofjustice/hmpps-auth/) and users and roles need to be added in order to run this application.

## Requirements

* Docker (Including Docker Compose)
* Node 12 (Including NPM) - If running locally

## Run

### Locally
The application uses `dotenv` to pick up a local file containing settings for environment variables called `.env`. This file will not be checked into Git. Speak to a member of the PVB dev team (#prison-visit-booking-dev on Slack) to populate or use the following credentials from the dev namespace:

```bash
DEVELOPMENT=true

# Local database
# APVS_DATABASE_SERVER='localhost'
# APVS_DATABASE='hwpv-local'
# APVS_INT_WEB_USERNAME='IntWebUsername'
# APVS_INT_WEB_PASSWORD='IntWebUsername'

# Dev database
APVS_DATABASE_SERVER='localhost'
APVS_DATABASE='hwpv-dev'
APVS_INT_WEB_USERNAME='IntWebUsername'
APVS_INT_WEB_PASSWORD='IntWebPassword'

APVS_MOJ_SSO_AUTHENTICATION_ENABLED='true'

APVS_MOJ_SSO_AUTHORIZE_PATH='/oauth/authorize'
APVS_MOJ_SSO_CLIENT_ID='help-with-prison-visits-3'
APVS_MOJ_SSO_CLIENT_SECRET='clientsecret'
APVS_MOJ_SSO_LOGOUT_PATH="/logout"
APVS_MOJ_SSO_REDIRECT_URI="http://localhost:3001/login/callback"
APVS_MOJ_SSO_SESSION_SECRET="test-secret"
APVS_MOJ_SSO_TOKEN_HOST='https://sign-in-dev.hmpps.service.justice.gov.uk/auth'
APVS_MOJ_SSO_TOKEN_PATH='/oauth/token'

MANAGE_USERS_API_URL='https://manage-users-api-dev.hmpps.service.justice.gov.uk'
MANAGE_USERS_API_PATH_PREFIX='/users'
MANAGE_USERS_API_USER_DETAILS_PATH='/me'
MANAGE_USERS_API_USER_EMAIL_PATH='/email'
MANAGE_USERS_API_USER_ROLES_PATH='/me/roles'

REDIS_HOST='localhost'
REDIS_PORT=6379
```

#### Database
It is possible to use the dev instance of the database which can then be used to set some of the above environment variables. This can be achieved by setting up a port-forwarding pod in Kubernetes so that the dev database can be forwarded to a local port. i.e. `kubectl -n <NAMESPACEHERE> run port-forward-pod --image=ministryofjustice/port-forward  --port=1433 --env="REMOTE_HOST=<RDS_DB>" --env="LOCAL_PORT=1433" --env="REMOTE_PORT=1433"` followed by setting up the port forward itself `kubectl -n <NAMESPACEHERE> port-forward pod/port-forward-pod 1433:1433`

Then install dependencies and run on port 3001.

```
npm install
npm start
```

### Docker Compose
This enables the application to run as a docker image locally and also contains setup to allow local instances of both redis and oauth to run to allow the app to work locally.

```
docker-compose build
docker-compose up
```

## Tests
Testing is currently being looked at. Local unit tests can currently be run using `npm run test`

Integration tests are being setup to be able to run locally.

e2e tests will be converted to use Cypress which is the current studio standard.


Run accessibility tests with [pa11y](https://github.com/pa11y/pa11y)
```
npm install -g pa11y
# requires existing claim data in local running environment so screens load correctly
# will generate a number of HTML reports with WCAG2AAA accessibility issues for pages
# usage: ./run-pa11y encryptedReferenceId claimId encryptedReference submittedDob submittedEncryptedReference submittedClaimId
./run-pa11y.sh 3d431e08aea55ea70faa 17 49411309bdb15b 1975-11-22 4e410d0bcda059 16
```

## Database

The application requires a MS SQL database instance, configured with an internal web user.


## Security

### CSRF
We are using [csurf](https://github.com/expressjs/csurf) for CSRF protection. All `POST` requests must have a valid CSRF token, which is added as a hidden input on HTML forms.

Use the following partial to add the hidden input:

```
{% include "partials/csrf-hidden-input.html" %}
```

### Reference/Reference ID encryption
In all instances where the Reference or Reference ID is used in the URL, it will be encrypted using AES encryption via the standard Node Crypto package.

Functions for encrypting/decrypting these values have been implemented in app/services/helpers directory.

### Redis

Redis is used as a session store so the app works correctly across multiple k8s pods. This can be setup locally as previously described using Docker Compose.


### HMPPS Auth / OAuth

[HMPPS Auth](https://github.com/ministryofjustice/hmpps-auth/) is used to authenticate users to the system. This can be setup locally as previously described using Docker Compose.
## Maintenance page

You can start the application in maintenance mode, this requires the `APVS_MAINTENANCE_MODE` setting to true and starting the node app normally. This will then display the maintenance page at `/app/views/includes/maintenance.html`
