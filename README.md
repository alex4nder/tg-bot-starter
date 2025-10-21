# Telegram Bot Starter Template

This repository is a boilerplate for creating Telegram bots of any complexity. The project is structured as a monorepo on TypeScript using [**Turborepo**](https://turbo.build/) and provides examples for setting up a server (`Express`), a client (`PrimeVue`), and a bot (`grammY`).

## Features

- **Monorepo Structure**: Organized using Turborepo to manage multiple services and packages.
- **Server, Client, Bot Examples**:
  - **Server**: Built with `Express`, serving as the backend API.
  - **Client**: Frontend interface using `PrimeVue`.
  - **Telegram Bot**: A sample bot created using the `grammY` framework.
- **Telegram Mini Apps Support**: Example included for creating and testing Telegram mini apps locally without HTTPS (in development).

This repo includes the following packages/apps:

### Apps and Packages

- `server`: Built with `Express`, serving as the backend API.
- `client`: Frontend interface using `PrimeVue`.
- `telegram-bot`: A sample bot created using the `grammY` framework.
- `@repo/logger`: for working with [log-vault](https://www.npmjs.com/package/log-vault).
- `@repo/queue`: provides a simple implementation of a job queue using [BullMQ](https://docs.bullmq.io/) for processing jobs in a scalable manner.
- `@repo/axios-wrapper`: a wrapper around the `Axios` library for convenient logging and error handling in HTTP requests.
- `@repo/config`: centralized configuration management to streamline environment variables and settings.
- `@repo/memstore`: simplified interface for working with `Redis`.
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

### Utilities

This repo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Getting Started

### Clone the Repository
```bash
git clone <repository-url>
cd <repository-directory>
```

### Install Dependencies
```bash
yarn install
```

### Settings environment variables
```bash
TG_BOT_TOKEN=<token>
```

### Build

To build all apps and packages, run the following command:

```
cd <repo>
yarn build
```

### Develop

To develop all apps and packages, run the following command:

```
cd <repo>
yarn dev
```

## Setting Up Telegram Test Server

To develop and test Telegram mini-apps effectively, it's beneficial to use the Telegram Test Server. This allows for local host testing and eliminates the HTTPS requirement for development.

### Accessing the Test Server

1. **Create an Account on Telegram Test Server**:
   - Register on the test server using your phone number.

2. **Setup Instructions by Platform**:

   #### Telegram on iOS:
   - Quickly tap the Settings section 10 times.
   - Tap `Accounts`, then `Login to another account`.
   - Tap `Test` to switch to the test server and create a new account.

   #### Telegram on Android:
   - Install Telegram Beta.
   - Open Telegram Beta, check "Test server" and create a new account.

3. **Telegram Desktop Configuration**:

   - **Windows**:
     - Open the side menu, expand the menu item where the username is shown.
     - Press **Shift + Alt** and right-click on `Add Account`.
     - Choose `Test Server`, then scan the QR code using a phone account on the test server.
   
   - **Mac OS**:
     - Click the Settings icon 10 times to open the Debug Menu.
     - Hold **⌘** and click `Add Account`.
     - Scan the QR code with a phone account on the test server.

4. **Create a Bot on Test Server**:
   - Open `@BotFather` on the Test Server and create your bot as usual.