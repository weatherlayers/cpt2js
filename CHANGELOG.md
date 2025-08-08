# Changelog

## 1.6.1

- publish dist directory

## 1.6.0

- rename export files to be recognized as CJS/ESM by extension
- reorder exports by priority, add default export
- update TS target
- update dependencies, use tsx --test and node:assert instead of jest

## 1.5.3

- add ESM exports

## 1.5.2

- fix parsing hex colors
- update dependencies

## 1.5.1

- fix parsing palettes with values in scientific notation

## 1.5.0

- rename `Cpt*` to `Palette*`
- fix tests with TS

## 1.4.1

- update TS exports

## 1.4.0

- migrate to TypeScript
- make `parseCptText`, `parseCptArray` private, use `parseCpt` instead
- trim text

## 1.3.1

- add `parseCpt` function with format autodetection
- remove superfluous overriding mode, can be overridden outside

## 1.3.0

- support both GMT4 and GMT5

## 1.2.4

- support both lowercase and uppercase mode (rgb and RGB)

## 1.2.3

- support PostGIS nodata values

## 1.2.2

- fix parsing alpha

## 1.2.1

- allow overriding mode

## 1.2.0

- refactor

## 1.1.0

- initial release
