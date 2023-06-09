# merchant-demo-server

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Overview

This is the back end server component that pairs with the [merchant-demo-spa](https://github.com/Permissionless-Software-Foundation/merchant-demo-spa) front end. These two pieces of software together make a simple app that merchants can use to sell items for Bitcoin Cash.

If you would like to hire someone to customize this app for your store, you can [find BCH developers here](https://fullstack.cash/consulting).

## Videos

- [Part 1: Introduction and Demo](https://youtu.be/jOv2c6kvdX4)
- [Part 2: Customizing the React front end](https://youtu.be/QghTUkx1hk0)
- [Part 3: Customizing the node.js back end](https://youtu.be/yMFNbqU3icM)
- [Part 4: Setting up email notifications](https://youtu.be/3gCvxNx-P30)

## Theory of Operation

This is a node.js JavaScript application using the [Koa framework](https://koajs.com/), to create a REST API web server. The [front end app](https://github.com/Permissionless-Software-Foundation/merchant-demo-spa) makes REST API calls to this back end software. There are two primary endpoints:

### POST /order

This endpoint creates a new order. This will take in the form information for the customer. It will return a BCH address and an amount of BCH to be paid. This information can then be displayed to the customer.

The balance of the address is periodically checked by the app. If the address recieves the payment, then the funds are used to send an end-to-end encrypted (**e2ee**) message the merchant with the form information, and the private key controlling the customer payment. If the order is not funded within 24 hours, it is deleted.

Paid orders are saved to a `PaidOrders` database entry. This allows merchants to easily retrieve a list of previous, funded orders.

Merchants can check for new e2ee messages using the [msg-check](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet#psf-bch-wallet-msg-check) and [msg-read](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet#psf-bch-wallet-msg-read) commands in psf-bch-wallet CLI wallet. The [e2ee-email-notifier](https://github.com/Permissionless-Software-Foundation/e2ee-email-notifier) is a second app that can configured to detect these e2ee messages, and notify the merchant via email that they have a new e2ee message.

### GET /order/payment/:bchAddr

This endpoint is called by the front end, to check if the payment has been detected and processed. This usually takes less than 5 minutes. Once the payment is detected, the front end can display a notification to the customer to let them know that their order has been processed.

## Requirements

- node **^16.19.0**
- npm **^8.19.3**
- Docker **^20.10.8**
- Docker Compose **^1.27.4**

## Installation

This application targets the Ubuntu Linux (version 18.04 or 20.04 LTS) operating system. If you use a different operating system, you mileage may vary.

- Install MongoDB by running the `./install-mongo-sh`

- Clone the repository and install the JavaScript dependencies:

```bash
git clone https://github.com/Permissionless-Software-Foundation/merchant-demo-server
cd merchant-demo-server
npm install
npm start
```

## Configuration

- Edit [these two lines in the config file](https://github.com/Permissionless-Software-Foundation/merchant-demo-server/blob/3370afab81ac0d39b3e0b338581f13888c1a1c65/config/env/common.js#L100-L102) to set the price of the product, and the BCH address of the merchant.

The BCH address for the merchant will be sent an end-to-end encrypted (e2ee) messages when a new order is placed and funded. Merchants can use the [msg-check](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet#psf-bch-wallet-msg-check) and [msg-read](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet#psf-bch-wallet-msg-read) commands in psf-bch-wallet CLI wallet. The [e2ee-email-notifier](https://github.com/Permissionless-Software-Foundation/e2ee-email-notifier) is a second app that can configured to detect these e2ee messages, and notify the merchant via email that they have a new e2ee message.


## Structure

The file layout of this repository differs from the koa-api-boilerplate. Instead, it follows the file layout of [Clean Architecture](https://christroutner.github.io/trouts-blog/blog/clean-architecture). The [Pedigree document](./PEDIGREE.md) links to the open source repositories used to build this application.

## Usage

- `npm start` Start server on live mode
- `npm run docs` Generate API documentation
- `npm test` Run mocha tests
- `docker-compose build` Build a 'production' Docker container
- `docker-compose up` Run the docker container

## License

[MIT](./LICENSE.md)
