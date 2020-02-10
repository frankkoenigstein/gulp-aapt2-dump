import { exec, ExecException } from 'child_process';
import { Transform } from 'stream';
import * as through from 'through2';
import * as Vinyl from 'vinyl';

export type DumpSubCommand =
  | 'apc' // Print the contents of the AAPT2 Container (APC) generated during compilation.
  | 'badging' // Print information extracted from the APK's manifest.
  | 'configurations' // Print every configuration used by a resource in the APK.
  | 'packagename' // Print the APK's package name.
  | 'permissions' // Print the permissions extracted from the APK's manifest.
  | 'strings' // Print the contents of the APK's resource table string pool.
  | 'styleparents' // Print the parents of styles used in the APK.
  | 'resources' // Print the contents of the APK's resource table.
  | 'xmlstrings' // Print strings from the APK's compiled xml.
  | 'xmltree'; // Print a tree of the APK's compiled xml.

/**
 * Dump options for `aapt2 dump`.
 */
export interface DumpOptions {
  noValues?: boolean; // Suppresses the output of values when displaying resource.
  file?: string; // Specifies a file as an argument to be dumped from the APK.
  v?: boolean; // Increases verbosity of the output.
}

function aapt2Dump(
  subCommand: DumpSubCommand,
  options?: DumpOptions
): Transform {
  if (!subCommand) {
    throw new Error('no sub-command specified');
  }

  return through.obj(
    (
      file: Vinyl,
      _encoding: string,
      callback: (err: Error, chunk: Vinyl) => void
    ) => {
      let aapt2Cmd = `aapt2 dump ${subCommand} "${file.path}"`;

      if (options) {
        if (options.noValues) {
          aapt2Cmd += ' --no-values';
        }

        if (options.file) {
          aapt2Cmd += ` --file "${options.file}"`;
        }

        if (options.v) {
          aapt2Cmd += ' -v';
        }
      }

      exec(
        aapt2Cmd,
        (error: ExecException, stdout: string, stderr: string): void => {
          if (error) {
            console.error(error, stderr);

            callback(error, null);
            return;
          }

          const dumpOutputFile: Vinyl = new Vinyl({
            base: file.base,
            cwd: file.cwd,
            path: file.path,
            contents: Buffer.from(stdout ? stdout : '')
          });

          dumpOutputFile.stem = `${file.stem}.dump.${subCommand}`;
          dumpOutputFile.extname = '';

          callback(null, dumpOutputFile);
        }
      );
    }
  );
}

export default aapt2Dump;
