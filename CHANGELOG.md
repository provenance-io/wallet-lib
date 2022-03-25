# CHANGELOG

## Unreleased

## 2.0.0

### Changed

- BREAKING CHANGE: Allow for custom gasPrice and denom to be used for calculations. If none is supplied default to use the figure gasPrice service [#40](https://github.com/provenance-io/wallet-lib/issues/40)
  - `gasPrice` and `feeDenom` are now REQUIRED to be passed into:
    - `MessageService.buildAuthInfo`
    - `MessageService.buildBroadcastTxRequest`
    - `MessageService.buildSimulateRequest`
  - `WalletService.transaction` now takes optional keys `gasPrice` and `denom` to set a custom gas price and denom to be used on a transaction.

## 1.1.3

### Fixed

- Renames provenance.marker.v1.authz.MarkerTransferAuthorization to provenance.marker.v1 MarkerTransferAuthorization for msgGrant. Fixes #37.

## 1.1.2

### Changed

- `ats` layout updated to show the buyer side fees as a Transaction Fee

## 1.1.1

### Fixed

`WalletService.disconnect` was incorrectly using `window.addEventListener`

## 1.0.2

### Changed

- `MsgExecuteContract` layout now supports `Disclaimer`

## 1.0.1

### Changed

- `coinDecimalConvert` now has `showFractional` param to display optional fractional decimal values

## 1.0.0

### This is a breaking change for provenance 1.7

### Changed

- Updated protos

### Added

- Multiple message support. `WalletService.transaction` now supports an array of message strings
- Support for `MsgGrant`

## 0.15.0

### Added

- Layout support for DCC smart contract
- Denom support for DCC denoms

## 0.14.0

### Fixed

- Use `Big` for denom conversion to fix decimal issues.

## 0.13.1

- `WalletService.initialize` now takes all parameters returned from `WalletService.connect`

## 0.13.0

### Changed

- Query param types reorganized for better readability in functions.

### Fixed

- `WalletService.initialize` now updates `sessionStorage`

### Added

- Autogenerate docs whenever code is merged to main [#25](https://github.com/provenance-io/wallet-lib/issues/25)

## 0.12.2

### Fixed

- MsgSend layout fix to reorder `estimatedValue` after `amountList`

## 0.12.1

### Fixed

- Check for values in return message before updating state in `WalletService.messageListener`. Due to a previous update wallet state was being overwritten with empty values after transaction.

## 0.12.0

### Added

- `estimatedValue` shows the total estimated value of the coin in a transaction and can be passed as a stringified CoinAsObject in the query param to be displayed in the layout

## 0.11.0

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
