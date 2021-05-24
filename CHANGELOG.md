# CHANGELOG

## Unreleased

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
