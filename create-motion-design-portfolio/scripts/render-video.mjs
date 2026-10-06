#!/usr/bin/env node
/**
 * Renders the 3D scene to a 1080x1920 MP4, frame by frame (deterministic, not a screen
 * recording). The storyboard lives in src/render/composition.ts:
 *   0-2s intro · 2-9s balancing · 9-18s reinforcing · 18-23s gut-glucose · 23-25s outro
 *
 * Requirements (not part of package.json on purpose):
 *   - `playwright-core` installed, plus a Chromium (playwright's own, or CHROME_PATH)
 *   - `ffmpeg` on PATH (or FFMPEG=/path/to/ffmpeg)
 *   - a running dev server (`npm run dev`), default http://localhost:5173
 *   - Google Fonts are not fetched while rendering; to get the exact typefaces offline
 *     point FONTS_DIR at a folder containing fonts.css (+ assets) that defines
 *     "Inter Tight", "JetBrains Mono" and a CJK face named "PingFang SC".
 *
 * Usage:
 *   node scripts/render-video.mjs [--theme orange|blue|green|purple] [--out video/cld.mp4] [--fps 30] [--still 1.2,10,20,24]
 *   --still dumps PNG snapshots at those times (seconds) instead of rendering the video.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createReadStream, mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  return index > -1 ? process.argv[index + 1] : fallback;
};

const theme = arg("theme", "orange"); // orange | blue | green | purple
const url = `${process.env.RENDER_URL ?? "http://localhost:5173/render.html"}?theme=${theme}`;
const out = arg("out", `video/cld-gut-glucose${theme === "orange" ? "" : `-${theme}`}.mp4`);
const fps = Number(arg("fps", 30));
const stills = arg("still", "")?.split(",").filter(Boolean).map(Number);
const WIDTH = 720, HEIGHT = 1280, SCALE = 1.5; // => 1080 x 1920

// --- optional local font server -------------------------------------------------
let fontServer;
if (process.env.FONTS_DIR) {
  const root = path.resolve(process.env.FONTS_DIR);
  fontServer = createServer((req, res) => {
    const file = path.join(root, decodeURIComponent(req.url.split("?")[0]));
    try {
      if (!file.startsWith(root) || !statSync(file).isFile()) throw new Error("nf");
      const type = file.endsWith(".css") ? "text/css" : "font/woff2";
      res.writeHead(200, { "content-type": type, "access-control-allow-origin": "*" });
      createReadStream(file).pipe(res);
    } catch {
      res.writeHead(404).end();
    }
  }).listen(5199);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: (process.env.CHROME_ARGS ?? "--no-sandbox").split(" ").filter(Boolean),
});
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: SCALE,
});
page.on("pageerror", (error) => console.error("page error:", error.message));
await page.goto(url, { waitUntil: "load" });
if (fontServer) await page.addStyleTag({ url: "http://localhost:5199/fonts.css" });
await page.waitForFunction(() => typeof window.__renderFrame === "function");
await page.evaluate(() => document.fonts.ready);
const duration = await page.evaluate(() => window.__duration);

const frame = async (time) => {
  await page.evaluate((t) => window.__renderFrame(t), time);
  return page.screenshot({ type: "png" });
};

if (stills?.length) {
  mkdirSync("video/stills", { recursive: true });
  for (const time of stills.sort((a, b) => a - b)) {
    const file = `video/stills/t${time.toFixed(2)}.png`;
    writeFileSync(file, await frame(time));
    console.log("wrote", file);
  }
} else {
  mkdirSync(path.dirname(out), { recursive: true });
  const total = Math.round(duration * fps);
  const ffmpeg = spawn(process.env.FFMPEG ?? "ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", out,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const closed = new Promise((resolve) => ffmpeg.on("close", resolve));
  const started = Date.now();
  for (let index = 0; index < total; index++) {
    const png = await frame(index / fps);
    if (!ffmpeg.stdin.write(png)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
    if (index % 30 === 0) {
      console.log(`frame ${index}/${total}  ${((Date.now() - started) / 1000).toFixed(0)}s`);
    }
  }
  ffmpeg.stdin.end();
  await closed;
  console.log("wrote", out);
}

await browser.close();
fontServer?.close();
