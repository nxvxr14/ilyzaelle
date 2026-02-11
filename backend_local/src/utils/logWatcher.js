// logWatcher.js — Watches server.log for new lines and emits them via a callback.
// Uses stat-based polling instead of fs.watch() for Windows compatibility.
// Handles the case where server.log does not exist yet.
import { open, read as fsRead, close, stat, statSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const LOG_FILE = resolve("server.log");
const POLL_MS = 500; // How often to check for new data (ms)

/**
 * Starts watching server.log for new lines.
 * If the file does not exist yet, polls until it appears.
 * Calls `onNewLine(line)` for each new line appended.
 * Returns a cleanup function to stop watching.
 */
export function startLogWatcher(onNewLine) {
  let offset = 0;
  let timer = null;
  let stopped = false;

  console.log(`[LogWatcher] Watching path: ${LOG_FILE}`);

  // Initialize offset if file already exists
  if (existsSync(LOG_FILE)) {
    initOffset();
    console.log("[LogWatcher] File found, polling for changes");
  } else {
    console.log("[LogWatcher] server.log not found yet, waiting...");
  }

  // Start the single polling loop
  timer = setInterval(poll, POLL_MS);

  /** Sets offset to current file size so we only emit NEW lines */
  function initOffset() {
    try {
      const stats = statSync(LOG_FILE);
      offset = stats.size;
      console.log(`[LogWatcher] Initial offset: ${offset} bytes`);
    } catch {
      offset = 0;
    }
  }

  /** Single poll tick: checks existence, then checks for new bytes */
  function poll() {
    if (stopped) return;

    if (!existsSync(LOG_FILE)) return;

    stat(LOG_FILE, (err, stats) => {
      if (err || stopped) return;

      // File was truncated or replaced — reset
      if (stats.size < offset) {
        offset = 0;
      }

      // No new data
      if (stats.size === offset) return;

      readNewBytes(stats.size);
    });
  }

  /** Reads bytes from offset to newSize and emits each line */
  function readNewBytes(newSize) {
    const bytesToRead = newSize - offset;
    const buffer = Buffer.alloc(bytesToRead);

    open(LOG_FILE, "r", (err, fd) => {
      if (err) return;

      fsRead(fd, buffer, 0, bytesToRead, offset, (err, bytesRead) => {
        close(fd, () => {});

        if (err || bytesRead === 0) return;

        offset += bytesRead;

        const text = buffer.toString("utf-8", 0, bytesRead);
        const lines = text.split("\n");

        for (const line of lines) {
          const trimmed = line.trimEnd();
          if (trimmed.length > 0) {
            onNewLine(trimmed);
          }
        }
      });
    });
  }

  // Cleanup
  return () => {
    stopped = true;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    console.log("[LogWatcher] Stopped");
  };
}
