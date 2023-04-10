# merchant-demo-server

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Overview

This is the back end server component that pairs with the [merchant-demo-spa](#) front end. These two pieces of software together make a simple app that merchants can use to sell items for Bitcoin Cash.

## Requirements

- node **^16.19.0**
- npm **^8.19.3**
- Docker **^20.10.8**
- Docker Compose **^1.27.4**

## Installation

### Development Environment


```bash
git clone https://github.com/Permissionless-Software-Foundation/merchant-demo-server
cd merchant-demo-server
./install-mongo-sh
sudo npm install -g node-pre-gyp
npm install
./ipfs-service-provider.sh
```

### Production Environment

The [docker](./production/docker) directory contains a Dockerfile for building a production deployment.

```
docker-compose pull
docker-compose up -d
```

You can bring the containers back up with `docker-compose up -d`.

## Structure

The file layout of this repository differs from the koa-api-boilerplate. Instead, it follows the file layout of [Clean Architecture](https://christroutner.github.io/trouts-blog/blog/clean-architecture).

## Usage

- `npm start` Start server on live mode
- `npm run docs` Generate API documentation
- `npm test` Run mocha tests
- `docker-compose build` Build a 'production' Docker container
- `docker-compose up` Run the docker container

## License

[MIT](./LICENSE.md)
