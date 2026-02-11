// logWatcher.js — Watches server.log for new lines and emits them via a callback.
// Handles the case where server.log does not exist yet (polls until it appears).
import { watch, open, read as fsRead, close, stat, statSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const LOG_FILE = resolve("server.log");
const POLL_INTERVAL_MS = 2000; // How often to check if the file exists

/**
 * Starts watching server.log for new lines.
 * If the file does not exist yet, polls every 2s until it appears.
 * Calls `onNewLine(line)` for each new line appended to the file.
 * Returns a cleanup function to stop watching.
 */
export function startLogWatcher(onNewLine) {
  let offset = 0;
  let watcher = null;
  let debounceTimer = null;
  let pollTimer = null;
  let stopped = false;

  console.log(`[LogWatcher] Watching path: ${LOG_FILE}`);

  // Entry point: check if file exists now, otherwise poll
  if (existsSync(LOG_FILE)) {
    attachWatcher();
  } else {
    console.log("[LogWatcher] server.log not found yet, polling until it appears...");
    startPolling();
  }

  /** Polls every POLL_INTERVAL_MS until server.log appears */
  function startPolling() {
    if (stopped) return;
    pollTimer = setInterval(() => {
      if (stopped) {
        clearInterval(pollTimer);
        return;
      }
      if (existsSync(LOG_FILE)) {
        console.log("[LogWatcher] server.log detected, attaching watcher");
        clearInterval(pollTimer);
        pollTimer = null;
        attachWatcher();
      }
    }, POLL_INTERVAL_MS);
  }

  /** Attaches fs.watch to the file and sets the initial offset */
  function attachWatcher() {
    if (stopped) return;

    // Set offset to current file size so we only emit NEW lines
    try {
      const stats = statSync(LOG_FILE);
      offset = stats.size;
      console.log(`[LogWatcher] Initial offset: ${offset} bytes`);
    } catch {
      offset = 0;
    }

    try {
      watcher = watch(LOG_FILE, { persistent: false }, (eventType) => {
        if (eventType === "rename") {
          // File was deleted or replaced — close watcher and go back to polling
          console.log("[LogWatcher] server.log renamed/deleted, switching to poll mode");
          cleanupWatcher();
          startPolling();
          return;
        }
        if (eventType !== "change") return;

        // Debounce rapid writes
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => readNewLines(), 50);
      });

      watcher.on("error", (err) => {
        console.error("[LogWatcher] Watch error:", err.message);
        cleanupWatcher();
        startPolling();
      });

      console.log("[LogWatcher] Watcher attached successfully");
    } catch (err) {
      console.error("[LogWatcher] Could not watch server.log:", err.message);
      startPolling();
    }
  }

  /** Reads only the bytes appended since last read */
  function readNewLines() {
    stat(LOG_FILE, (err, stats) => {
      if (err) return;

      // File was truncated or replaced — reset offset
      if (stats.size < offset) {
        offset = 0;
      }

      if (stats.size === offset) return;

      const bytesToRead = stats.size - offset;
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
    });
  }

  /** Cleans up only the watcher (not the whole instance) */
  function cleanupWatcher() {
    if (watcher) {
      watcher.close();
      watcher = null;
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  }

  // Return full cleanup function
  return () => {
    stopped = true;
    cleanupWatcher();
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    console.log("[LogWatcher] Stopped");
  };
}
