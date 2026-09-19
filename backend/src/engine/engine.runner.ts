import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import { env } from '../config/env';
import {
  ENGINE_TIMEOUT_MS,
  MAX_STDOUT_BYTES,
  MAX_CONCURRENT_PROCESSES,
} from '../config/constants';
import {
  EngineRequest,
  EngineResponse,
  EngineSuccessResponse,
  EngineErrorResponse,
  EngineTimeoutError,
  OutputLimitExceededError,
  ConcurrencyLimitExceededError,
  EngineExecutionError,
  ServiceUnavailableError,
} from './engine.types';

let activeProcesses = 0;

export function getActiveProcessCount(): number {
  return activeProcesses;
}

export function resetConcurrencyForTesting(): void {
  activeProcesses = 0;
}

export function setMockActiveProcessesForTesting(count: number): void {
  activeProcesses = count;
}

export function verifyEngineBinary(binaryPath: string): void {
  if (!fs.existsSync(binaryPath)) {
    throw new ServiceUnavailableError(`Engine binary not found`);
  }

  const mode = process.platform === 'win32' ? fs.constants.R_OK : fs.constants.X_OK;
  try {
    fs.accessSync(binaryPath, mode);
  } catch {
    throw new ServiceUnavailableError(`Engine binary lacks execution permissions`);
  }
}

export interface RunEngineOptions {
  enginePath?: string;
  timeoutMs?: number;
  maxStdoutBytes?: number;
}

export function runEngine(
  payload: EngineRequest,
  options?: RunEngineOptions
): Promise<EngineResponse> {
  const binaryPath = options?.enginePath ?? env.ENGINE_PATH;
  const timeoutMs = options?.timeoutMs ?? ENGINE_TIMEOUT_MS;
  const maxStdoutBytes = options?.maxStdoutBytes ?? MAX_STDOUT_BYTES;

  // 1. Verify engine binary usability
  verifyEngineBinary(binaryPath);

  // 2. Concurrency check (Counting Semaphore)
  if (activeProcesses >= MAX_CONCURRENT_PROCESSES) {
    throw new ConcurrencyLimitExceededError();
  }

  activeProcesses++;
  let slotAcquired = true;

  return new Promise<EngineResponse>((resolve, reject) => {
    let settled = false;
    let child: ChildProcess;

    const cleanupAndSettle = (err?: Error, result?: EngineResponse) => {
      if (settled) return;
      settled = true;

      clearTimeout(timer);

      if (child) {
        child.stdout?.removeAllListeners();
        child.stderr?.removeAllListeners();
        child.stdin?.removeAllListeners();
        child.removeAllListeners('exit');
        child.removeAllListeners('close');
        child.removeAllListeners('error');

        try { child.stdin?.destroy(); } catch {}
        try { child.stdout?.destroy(); } catch {}
        try { child.stderr?.destroy(); } catch {}

        try {
          if (!child.killed) {
            child.kill();
          }
        } catch {}
      }

      if (slotAcquired) {
        activeProcesses = Math.max(0, activeProcesses - 1);
        slotAcquired = false;
      }

      if (err) {
        reject(err);
      } else if (result) {
        resolve(result);
      }
    };

    // 3. Setup timeout
    const timer = setTimeout(() => {
      cleanupAndSettle(new EngineTimeoutError());
    }, timeoutMs);

    // 4. Spawn child process (Direct child, shell: false, ZERO CLI args)
    try {
      child = spawn(binaryPath, [], {
        shell: false,
        windowsHide: true,
      });
    } catch (spawnErr: any) {
      if (spawnErr.code === 'ENOENT' || spawnErr.code === 'EACCES') {
        cleanupAndSettle(new ServiceUnavailableError());
      } else {
        cleanupAndSettle(new EngineExecutionError());
      }
      return;
    }

    if (!child.stdin || !child.stdout || !child.stderr) {
      cleanupAndSettle(new EngineExecutionError('Failed to initialize child process streams'));
      return;
    }

    child.on('error', (err: any) => {
      if (settled) return;
      if (err.code === 'ENOENT' || err.code === 'EACCES') {
        cleanupAndSettle(new ServiceUnavailableError());
      } else {
        cleanupAndSettle(new EngineExecutionError());
      }
    });

    // 5. Stdin transmission
    child.stdin.on('error', () => {
      // Ignore EPIPE or write errors; close handler captures process exit
    });

    try {
      child.stdin.write(JSON.stringify(payload));
      child.stdin.end();
    } catch {
      // Ignore write errors; close handler handles exit
    }

    // 6. Stdout streaming with byte limit
    let totalBytes = 0;
    const stdoutChunks: Buffer[] = [];

    child.stdout.on('data', (chunk: Buffer) => {
      if (settled) return;

      totalBytes += chunk.length;
      if (totalBytes > maxStdoutBytes) {
        cleanupAndSettle(new OutputLimitExceededError());
      } else {
        stdoutChunks.push(chunk);
      }
    });

    // 7. Stderr collection (capped at 64KB for safety)
    let stderrBytes = 0;
    child.stderr.on('data', (chunk: Buffer) => {
      if (settled) return;
      stderrBytes += chunk.length;
      if (stderrBytes > 65536) {
        child.stderr?.removeAllListeners('data');
      }
    });

    // 8. Process completion
    child.on('close', () => {
      if (settled) return;

      const stdoutStr = Buffer.concat(stdoutChunks).toString('utf-8').trim();

      if (!stdoutStr) {
        cleanupAndSettle(new EngineExecutionError());
        return;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(stdoutStr);
      } catch {
        cleanupAndSettle(new EngineExecutionError());
        return;
      }

      if (typeof parsed !== 'object' || parsed === null || typeof parsed.success !== 'boolean') {
        cleanupAndSettle(new EngineExecutionError());
        return;
      }

      if (parsed.success === true) {
        if (typeof parsed.algorithm !== 'string' || !Array.isArray(parsed.events)) {
          cleanupAndSettle(new EngineExecutionError());
          return;
        }
        cleanupAndSettle(undefined, parsed as EngineSuccessResponse);
      } else {
        const errMsg = typeof parsed.error === 'string' && parsed.error.length > 0
          ? parsed.error
          : 'Algorithm visualization engine reported an error';

        cleanupAndSettle(undefined, {
          success: false,
          error: errMsg,
          total_steps: typeof parsed.total_steps === 'number' ? parsed.total_steps : 0,
          events: Array.isArray(parsed.events) ? parsed.events : [],
        } as EngineErrorResponse);
      }
    });
  });
}
