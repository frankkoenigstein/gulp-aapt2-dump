# gulp-aapt2-dump

[AAPT2 Dump] pipe for [Vinyl](https://github.com/gulpjs/vinyl) streams.

[![NPM](https://nodei.co/npm/gulp-aapt2-dump.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/gulp-aapt2-dump/)

<details>
  <summary>Table of contents</summary>
<!-- TOC depthFrom:2 -->

- [Usage](#usage)
  - [Declaration](#declaration)
  - [Example](#example)
  - [Dump sub-commands](#dump-sub-commands)
  - [Dump options](#dump-options)
- [License](#license)

<!-- /TOC -->
</details>

## Usage

Calls `aapt2 dump ${subCommand}` for streamed files and passes `sdtout` to the stream.

### Declaration

```ts
declare function aapt2Dump(
  subCommand: DumpSubCommand,
  options?: DumpOptions
): Transform;
```

### Example

`aapt2` has to be in `$PATH`.

```ts
import { src, dest } from 'gulp';
import aapt2Dump from 'gulp-aapt2-dump';

src('build/**/*.apk')
  .pipe(dest('dist')) // write apk to dist
  .pipe(aapt2Dump('badging', { v: true }))
  .pipe(dest('dist')); // write dump to dist
```

### Dump sub-commands

Can be any of

- `apc`
- `badging`
- `configurations`
- `packagename`
- `permissions`
- `strings`
- `styleparents`
- `resources`
- `xmlstrings`
- `xmltree`

### Dump options

```ts
/**
 * Dump options for aapt2 dump.
 */
export interface DumpOptions {
  noValues?: boolean; // Suppresses the output of values when displaying resource.
  file?: string; // Specifies a file as an argument to be dumped from the APK.
  v?: boolean; // Increases verbosity of the output.
}
```

## License

[MIT License]

[aapt2 dump]: https://developer.android.com/studio/command-line/aapt2#dump
[mit license]: http://en.wikipedia.org/wiki/MIT_License
