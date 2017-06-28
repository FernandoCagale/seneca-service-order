FROM mhart/alpine-node:8.1.2

RUN apk add --update \
    make \
    gcc \
    g++ \
    python

WORKDIR /src

ADD npm-shrinkwrap.json ./
ADD package.json ./
RUN npm install

ADD / ./

CMD ["node", "./service.js", "--seneca-log=type:act"]