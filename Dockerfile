# Stage: base image
FROM node:20.9-bullseye-slim as base

ARG BUILD_NUMBER=1_0_0
ARG GIT_REF=not-available

LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"

ENV TZ=Europe/London
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

RUN addgroup --gid 2000 --system appgroup && \
    adduser --uid 2000 --system appuser --gid 2000

WORKDIR /app

ENV BUILD_NUMBER ${BUILD_NUMBER:-1_0_0}

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

#RUN apt-get update && \
#    apt-get -y upgrade && \
#    apt-get install -y libfreetype6 && \
#    apt-get install -y libfontconfig1 && \
#    apt-get install -y curl && \
#    rm -rf /var/lib/apt/lists/*

# Stage: build assets
FROM base as build

ARG BUILD_NUMBER=1_0_0
ARG GIT_REF=not-available

RUN apt-get update && \
    apt-get install -y make python g++

COPY package*.json ./
RUN CYPRESS_INSTALL_BINARY=0 npm ci --no-audit

COPY . .
RUN npm run css-build

RUN export BUILD_NUMBER=${BUILD_NUMBER} && \
    export GIT_REF=${GIT_REF} && \
    npm run record-build-info

RUN npm prune --no-audit --omit=dev

# Stage: copy production assets and dependencies
FROM base

RUN mkdir /app/logs && chown appuser:appgroup /app/logs
RUN mkdir /app/uploads && chown appuser:appgroup /app/uploads
RUN mkdir /app/AuditReports && chown appuser:appgroup /app/AuditReports

USER 2000
WORKDIR /app

COPY --from=build --chown=appuser:appgroup \
        /app/package.json \
        /app/package-lock.json \
        /app/knexfile.js \
        /app/config.js \
        /app/build-info.json \
        /app/build-css \
        ./

COPY --from=build --chown=appuser:appgroup \
        /app/node_modules ./node_modules

COPY --from=build --chown=appuser:appgroup \
        /app/app ./app

ENV PORT=3001

EXPOSE 3001
USER 2000

HEALTHCHECK CMD curl --fail http://localhost:3001/status || exit 1

CMD [ "node", "./app/bin/www" ]
