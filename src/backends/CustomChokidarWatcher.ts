import { Logger } from '../Logger';
import { FileWatchingBackend } from './FileWatchingBackend';
import * as chokidar from 'chokidar';

const log = Logger.child({
  namespace: 'CustomChokidarWatcher',
});

export class CustomChokidarWatcher extends FileWatchingBackend {
  private chokidar: chokidar.FSWatcher;

  private indexingIntervalId: NodeJS.Timeout;

  public constructor(project: string) {
    super();

    let discoveredFileCount = 0;

    this.indexingIntervalId = setInterval(() => {
      log.trace(
        'indexed %s %s...',
        discoveredFileCount.toLocaleString('en-US'),
        discoveredFileCount === 1 ? 'file' : 'files',
      );
    }, 5_000);

    this.chokidar = chokidar.watch(project, {
      awaitWriteFinish: false,
      followSymlinks: true,
      ignored: [
        'node_modules',
        '.turbo',
        'dist',
        'out',
        'abi',
        'types',
        'build',
        'bin',
        'protoc',
        'protobuf',
        'src/mud-definitions',
        '.parcel-cache',

        'node_modules/**',
        '.turbo/**',
        'dist/**',
        'out/**',
        'abi/**',
        'types/**',
        'build/**',
        'bin/**',
        'protoc/**',
        'protobuf/**',
        'src/mud-definitions/**',
        '.parcel-cache/**',

        '**/node_modules/**',
        '**/.turbo/**',
        '**/dist/**',
        '**/out/**',
        '**/abi/**',
        '**/types/**',
        '**/build/**',
        '**/bin/**',
        '**/protoc/**',
        '**/protobuf/**',
        '**/src/mud-definitions/**',
        '**/.parcel-cache/**',
      ],
    });

    let ready = false;

    this.chokidar.on('ready', () => {
      clearInterval(this.indexingIntervalId);

      ready = true;

      this.emitReady();
    });

    this.chokidar.on('all', (event, filename) => {
      if (!ready) {
        discoveredFileCount++;

        return;
      }

      if (event === 'addDir') {
        return;
      }

      this.emitChange({ chokidar: this.chokidar, filename });
    });
  }

  public close() {
    clearInterval(this.indexingIntervalId);

    return this.chokidar.close();
  }
}
