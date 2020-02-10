import * as child_process from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Readable, Transform } from 'stream';
import * as Vinyl from 'vinyl';

import aapt2Dump, { DumpOptions, DumpSubCommand } from './index';

describe('aapt2 dump', () => {
  // beforeEach(() => jest.spyOn(console, 'log').mockImplementation());
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation());

  describe('create transform', () => {
    it('should return transform object', () => {
      expect(typeof aapt2Dump('badging')).toBe('object');
    });

    it('should check subcommand', () => {
      expect(() => aapt2Dump(null)).toThrowError();
    });
  });

  describe('use transform', () => {
    const subCommand: DumpSubCommand = 'badging';
    let transform: Transform;
    let execSpy: jest.SpyInstance;
    let stream: Readable; // input for aapt2
    let streamInput: Vinyl;

    beforeAll(() => (execSpy = jest.spyOn(child_process, 'exec')));

    beforeEach(() => {
      execSpy.mockReset();

      stream = new Readable({
        objectMode: true,
        read() {}
      });
      transform = stream.pipe(aapt2Dump(subCommand));

      streamInput = new Vinyl({
        base: 'base',
        path: 'base/foo/bar.apk'
      });
    });

    it('should exec aapt2', (done) => {
      execSpy.mockImplementation((_, cb: () => void) => cb());

      transform.on('data', () => {
        expect(execSpy).toHaveBeenCalledTimes(1);
        expect(execSpy).toHaveBeenCalledWith(
          `aapt2 dump ${subCommand} "${streamInput.path}"`,
          expect.any(Function)
        );
        done();
      });

      stream.push(streamInput);
    });

    describe('options', () => {
      beforeEach(() => execSpy.mockImplementation((_, cb: () => void) => cb()));

      it.each<[DumpOptions, string]>([
        [{ noValues: true }, ' --no-values'],
        [{ file: 'murx.txt' }, ' --file "murx.txt"'],
        [{ v: true }, ' -v'],
        [
          { noValues: true, file: 'murx.txt', v: true },
          ' --no-values --file "murx.txt" -v'
        ]
      ])('should use options %o', (options: DumpOptions, expected: string) => {
        const streamOptions = new Readable({
          objectMode: true,
          read() {}
        });
        const transformOptions = streamOptions.pipe(
          aapt2Dump(subCommand, options)
        );

        return new Promise<void>((resolve) => {
          transformOptions.on('data', () => {
            expect(execSpy).toHaveBeenCalledTimes(1);
            expect(execSpy).toHaveBeenCalledWith(
              `aapt2 dump ${subCommand} "${streamInput.path}"${expected}`,
              expect.any(Function)
            );

            resolve();
          });

          streamOptions.push(streamInput);
        });
      });
    });

    it('should call callback with vinyl', (done) => {
      execSpy.mockImplementation((_, cb: () => void) => cb());
      transform.on('data', (data: Vinyl) => {
        expect(data instanceof Vinyl).toBeTruthy();
        expect(data.path).toBe(
          `${join('base', 'foo', 'bar')}.dump.${subCommand}`
        );
        expect(data.contents).toBeTruthy();
        done();
      });

      stream.push(streamInput);
    });

    it('should handle error', (done) => {
      execSpy.mockImplementation((_, cb: (error: Error) => void) =>
        cb(new Error('exec error'))
      );

      transform.on('error', (err: Error) => {
        expect(err.message).toBe('exec error');
        done();
      });

      transform.on('data', fail);

      stream.push(streamInput);
    });
  });

  describe('sub-commands', () => {
    describe('badging', () => {
      const subCommand: DumpSubCommand = 'badging';
      let transform: Transform;
      let execSpy: jest.SpyInstance;
      let stream: Readable; // input for aapt2
      let streamInput: Vinyl;

      const debugDump: string = readFileSync(
        join(__dirname, '..', 'test', 'dump-badging-debug.txt')
      ).toString();

      beforeEach(() => {
        execSpy = jest.spyOn(child_process, 'exec');

        stream = new Readable({
          objectMode: true,
          read() {}
        });
        transform = stream.pipe(aapt2Dump(subCommand));

        streamInput = new Vinyl({
          base: 'base',
          path: 'base/foo/bar.apk'
        });
      });

      it('should parse debug output', (done) => {
        execSpy.mockImplementation(
          (_, cb: (error: Error, stdout: string, stderr: string) => void) =>
            cb(null, debugDump, null)
        );

        transform.on('data', (data: Vinyl) => {
          expect(data.contents.toString()).toEqual(debugDump);
          done();
        });

        stream.push(streamInput);
      });
    });
  });
});
