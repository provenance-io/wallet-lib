# CHANGELOG

## Unreleased

### Added

- More logging in `develop` mode
- `logOnStaging` for logs in `staging` mode

### Changed

- `buildAuthInfo` now has `gasPrice` and `feeBuffer` parameters

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
