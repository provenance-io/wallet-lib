# CHANGELOG

## Unreleased

### Changed

- `MsgExecuteContract` `ats` layout now supports versioning to handle new ATS smart contract format concurrently with old format. 
- Wallet recognition of contract version is handled via `atsVersion` query param in `transaction` window
- Wallet windows will now poll for manual window close via `pollForOpenWindow` in `WalletService`

## 0.10.0

### Changed

- `WalletService` will now update state on both `SIGNATURE_COMPLETE` and `TRANSACTION_COMPLETE`. Previously state was only updated on `CONNECTED`.

## 0.9.2

### Changed

- `WalletService` now sends `window.location.origin` to wallet windows via query param `origin`. Used in wallet side for added security in `postMessage`
- `WINDOW_MESSAGES.READY_FOR_POST_MESSAGE` event added, wallets should send this message when they need to receive a `postMessage`, and are ready to do so.
- `WalletService.sign` now waits for `READY_FOR_POST_MESSAGE` event before sending the payload message.

## 0.9.1

### Changed

- `WalletService.sign` now uses `postMessage` instead of query param to transfer data. Data can now be string or byte array. Will return the type that was passed in.

## 0.9.0

### Added

- `WalletService.sign` for signing of generic Base64 string.

### Changed

- `WalletService` will now add and remove the `onmessage` handler before and after each wallet interaction. `WalletService.disconnect` will also remove the handler.

## 0.8.1

### Changed

- `WalletService` will pass through messages to event listeners as `message` in the callback data

## 0.8.0

### Added

- `WalletService` now implements `initialize` to allow wallets to be initialized manually

### Changed

- `WINDOW_MESSAGES.TRANSACTION_COMPLETE` now expects `txhash` to be returned

### Fixed

- `WalletService` will now call `updateState` on `disconnect`

## 0.7.0

### Added

- `GrpcService.getTx`, the tx service endpoint to query for existence of tx after broadcasting transaction

### Changed

- `GrpcService.broadcastTx`, `GrpcService.simulate` and `GrpcService.getBalancesList` now return their corresponding response as `response.AsObject`

## 0.6.0

### Added

- Support for memos in transactions and message layouts.

## 0.5.0

### Added

- Support for `cfigureomni` denom

### Fixed

- Eslint config updated per https://github.com/prettier/eslint-config-prettier/blob/main/CHANGELOG.md#version-800-2021-02-21
- `feeBuffer` removed, `gasPrice` rounding error fixed.

## 0.4.0

### Added

- `walletService.removeEventListener` and `walletService.removeAllEventListeners` for event listener cleanup
- `walletService.disconnect` for clean wallet disconnect
- `walletService.removeAllEventListeners` will run automatically when hook or context unmounts

## 0.3.0

### Added

- More logging in `develop` mode
- `logOnStaging` for logs in `staging` mode

### Changed

- `buildAuthInfo` now has `gasPrice` and `feeBuffer` parameters
- loose option on babel plugins removed

### Fixed

- `useWalletService` will now instantiate its own `WalletService` instance

## 0.2.0

### Added

- `useWalletService` hook to support multiple wallets

### Changed

- `walletService` postMessage origin check now supports origin with path suffix
- Updates to the README

### Fixed

- `exchangesc` now shows 3 decimal places

## 0.1.0

- Initial Deploy
