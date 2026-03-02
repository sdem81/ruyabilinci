const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const isDesktop = args.includes("--desktop");
const isMobile = args.includes("--mobile") || !isDesktop;

const baseUrl = (process.env.LIGHTHOUSE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
const minScore = Number(process.env.LIGHTHOUSE_MIN_SCORE || "95");
const paths = (process.env.LIGHTHOUSE_PATHS || "/,/kategori/iliskiler,/iletisim")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const reportDir = path.join(process.cwd(), ".lighthouse");
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

function runLighthouse(url, outputPath) {
  const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
  const cliArgs = [
    "lighthouse",
    url,
    "--quiet",
    "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage --ignore-certificate-errors --allow-insecure-localhost",
    "--only-categories=performance,seo",
    "--output=json",
    `--output-path=${outputPath}`,
  ];

  if (isDesktop) {
    cliArgs.push("--preset=desktop");
  }

  const result = spawnSync(npxCommand, cliArgs, {
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`Lighthouse failed for ${url}`);
  }
}

const failures = [];

console.log(`\n🔍 Lighthouse mode: ${isDesktop ? "desktop" : "mobile"}`);
console.log(`🔗 Base URL: ${baseUrl}`);
console.log(`🎯 Threshold: performance>=${minScore}, seo>=${minScore}\n`);

for (const routePath of paths) {
  const url = `${baseUrl}${routePath.startsWith("/") ? routePath : `/${routePath}`}`;
  const fileName = routePath === "/" ? "home" : routePath.replace(/[\\/:*?"<>|]/g, "_").replace(/^_+/, "");
  const outputPath = path.join(reportDir, `${fileName}.${isDesktop ? "desktop" : "mobile"}.json`);

  console.log(`➡️  Auditing: ${url}`);
  runLighthouse(url, outputPath);

  const report = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  const perf = Math.round((report.categories.performance.score || 0) * 100);
  const seo = Math.round((report.categories.seo.score || 0) * 100);

  console.log(`   Performance: ${perf} | SEO: ${seo}\n`);

  if (perf < minScore || seo < minScore) {
    failures.push({ url, perf, seo });
  }
}

if (failures.length > 0) {
  console.error("❌ Threshold failed on the following pages:");
  for (const fail of failures) {
    console.error(`   - ${fail.url} (performance=${fail.perf}, seo=${fail.seo})`);
  }
  process.exit(1);
}

console.log("✅ All audited pages passed threshold.");
