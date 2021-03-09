# Provenance Frontlib Wallet

Library to interface with Provenance browser keychain wallet.

## Use

Add `NEXUS_NPM_TOKEN` env var to your system, consisting of the base64 hash of your Nexus credentials.

```bash
echo -n 'myuser:mypassword' | openssl base64
```

Make sure your npm project has an `.npmrc` file pointed at our nexus registry.

```bash
registry=https://nexus.figure.com/repository/npm-group/
_auth=${NEXUS_NPM_TOKEN}
save-exact=true
```

Import the dependency

```bash
npm install @provenace/frontlib-wallet --save
```

## Storybook

```bash
npm run start
```

## Watch for changes and run build

```bash
npm run watch
```
