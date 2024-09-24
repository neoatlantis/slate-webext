NeoAtlantis Web Slate
=====================

## 1. What's this

This project is a Firefox addon, that intended to be published on the mentioned
browser's addon listing or as self hosted by me.

The addon utilizes a cryptographic random oracle function (we call it later
as `core`) to derive a useful passphrase for any website, based on a
`password request url`.

A `password request url` can be a substitute of a stored entry in a password
manager database. In case when a password manager is compromised, all passwords
are revealed. But with this new method, revealed `password request url`s
are useless and cannot be used to calculate passwords or correlate between
accounts.

The `password request url`s contain random-generated and signed parameters
to make sure the url is bound to the named domain. This prevents phishing
attacks, as similar but different domains are differentiated.

Attackers may only utilize `password request url`s when they have also gained
access to a properly initialized Slate. This is difficult due to several
techniques applied in programming. The file used for initializing `core` is
password protected, and never transmitted over Internet. During initializion,
a decryption briefly loads the decrypted entropy, derives the necessary keys,
and the decrypted data is made inaccesible again. The keys derived are marked
as non-exportable, thus their secret bytes cannot be accidentially revealed.
And finally we apply strict CSP policies to ensure only trusted script may
execute, and no connection to foreign websites is possible.

## 2. Build instruction

`src/` folder contains all source files necessary to reproduce the `.zip` file
required for submission.

`package.json` lists external libraries depended for building. Among them,
we use `password-security-module` as another project for this addon. It's
source code is located at [github](https://github.com/neoatlantis/password-security-module)
and published at [npm](https://www.npmjs.com/package/password-security-module).

To build, first use `npm` or `pnpm` to install all dependencies:

> npm i

Then call `npm run dist` to generate all output files to `dist/` folder.

Finally call `web-ext build -s dist/` to make a zip package.
