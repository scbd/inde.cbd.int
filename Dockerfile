FROM node:22-alpine

RUN apk add --no-cache git curl

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnrc.yml ./
COPY vendor ./vendor

RUN yarn install --network-timeout 600000

ENV PORT=8000

EXPOSE 8000

COPY . ./

ARG COMMIT
ENV COMMIT=$COMMIT

CMD [ "node", "server" ]
