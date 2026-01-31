#!/usr/bin/env npx ts-node

/**
 * Browser Console Error Checker
 *
 * This script starts a Next.js dev server, opens the application in a headless browser,
 * navigates through key pages, and checks for JavaScript console errors.
 *
 * Used as part of pre-commit hooks to catch runtime errors before they're committed.
 */

import { chromium, Browser, Page, ConsoleMessage } from "@playwright/test";
import { spawn, ChildProcess } from "child_process";
import { setTimeout } from "timers/promises";

interface ConsoleError {
  type: string;
  text: string;
  url: string;
  location?: {
    url: string;
    lineNumber: number;
    columnNumber: number;
  };
}

const PORT = 3333; // Use a different port to avoid conflicts with dev server
const BASE_URL = `http://localhost:${PORT}`;
const WAIT_FOR_SERVER_MS = 30000;
const PAGE_LOAD_TIMEOUT_MS = 30000;

// Pages to check for console errors
const PAGES_TO_CHECK = ["/"];

// Patterns to ignore in console errors (e.g., known third-party issues)
const IGNORED_PATTERNS: RegExp[] = [
  /Download the React DevTools/,
  /You are running a development build of React/,
  /Warning: ReactDOM.render is no longer supported/,
  /Hydration failed because/,
  /There was an error while hydrating/,
  /Text content does not match server-rendered/,
];

async function waitForServer(
  url: string,
  timeoutMs: number
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch {
      // Server not ready yet
    }
    await setTimeout(500);
  }

  return false;
}

async function startDevServer(): Promise<ChildProcess> {
  console.log("🚀 Starting Next.js dev server...");

  const devServer = spawn("npx", ["next", "dev", "-p", PORT.toString()], {
    cwd: "./web",
    stdio: ["ignore", "pipe", "pipe"],
  });

  // Log server output for debugging
  devServer.stdout?.on("data", (data: Buffer) => {
    const output = data.toString().trim();
    if (output && process.env.VERBOSE) {
      console.log(`  [server] ${output}`);
    }
  });

  devServer.stderr?.on("data", (data: Buffer) => {
    const output = data.toString().trim();
    if (output && process.env.VERBOSE) {
      console.error(`  [server error] ${output}`);
    }
  });

  return devServer;
}

function shouldIgnoreError(message: string): boolean {
  return IGNORED_PATTERNS.some((pattern) => pattern.test(message));
}

async function checkPageForErrors(
  page: Page,
  url: string
): Promise<ConsoleError[]> {
  const errors: ConsoleError[] = [];

  // Collect console messages
  const handleConsoleMessage = (msg: ConsoleMessage) => {
    const type = msg.type();
    const text = msg.text();

    // Debug: log all console messages when VERBOSE is set
    if (process.env.VERBOSE) {
      console.log(`  [console.${type}] ${text}`);
    }

    // Capture errors and warnings that are actual issues
    if ((type === "error" || type === "warning") && !shouldIgnoreError(text)) {
      const location = msg.location();
      errors.push({
        type,
        text,
        url,
        location: {
          url: location.url,
          lineNumber: location.lineNumber,
          columnNumber: location.columnNumber,
        },
      });
    }
  };

  page.on("console", handleConsoleMessage);

  // Also capture unhandled exceptions
  page.on("pageerror", (error: Error) => {
    if (!shouldIgnoreError(error.message)) {
      errors.push({
        type: "pageerror",
        text: error.message,
        url,
      });
    }
  });

  try {
    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: PAGE_LOAD_TIMEOUT_MS,
    });

    // Scroll through the entire page to trigger lazy-loaded components
    // This ensures all Exercise/Terminal components mount and any warnings appear
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = 720;
    let currentScroll = 0;

    while (currentScroll < scrollHeight) {
      await page.evaluate((y) => window.scrollTo(0, y), currentScroll);
      await setTimeout(100); // Brief pause to allow components to mount
      currentScroll += viewportHeight;
    }

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));

    // Wait a bit for any async errors to appear
    await setTimeout(2000);
  } catch (error) {
    errors.push({
      type: "navigation",
      text: `Failed to navigate to ${url}: ${error}`,
      url,
    });
  }

  page.off("console", handleConsoleMessage);

  return errors;
}

async function main(): Promise<void> {
  let devServer: ChildProcess | null = null;
  let browser: Browser | null = null;

  try {
    // Start the dev server
    devServer = await startDevServer();

    // Wait for the server to be ready
    console.log("⏳ Waiting for server to be ready...");
    const serverReady = await waitForServer(BASE_URL, WAIT_FOR_SERVER_MS);

    if (!serverReady) {
      console.error("❌ Server failed to start within timeout");
      process.exit(1);
    }

    console.log("✅ Server is ready");

    // Launch headless browser
    console.log("🌐 Launching headless browser...");
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();

    let allErrors: ConsoleError[] = [];

    // Check each page
    for (const pagePath of PAGES_TO_CHECK) {
      const fullUrl = `${BASE_URL}${pagePath}`;
      console.log(`📄 Checking ${pagePath}...`);

      const errors = await checkPageForErrors(page, fullUrl);
      allErrors = allErrors.concat(errors);
    }

    await browser.close();
    browser = null;

    // Report results
    if (allErrors.length > 0) {
      console.error("\n❌ Console errors found:\n");
      allErrors.forEach((error, index) => {
        console.error(`  ${index + 1}. [${error.type}] ${error.text}`);
        if (error.location?.url) {
          console.error(
            `     at ${error.location.url}:${error.location.lineNumber}:${error.location.columnNumber}`
          );
        }
        console.error("");
      });
      process.exit(1);
    } else {
      console.log("\n✅ No console errors found!");
    }
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }

    if (devServer) {
      console.log("🧹 Stopping dev server...");
      devServer.kill("SIGTERM");

      // Wait a bit for graceful shutdown
      await setTimeout(1000);

      // Force kill if still running
      if (!devServer.killed) {
        devServer.kill("SIGKILL");
      }
    }
  }
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
