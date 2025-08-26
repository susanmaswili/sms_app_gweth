import { exec } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import localtunnel from "localtunnel";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildFrontend() {
  console.log("📦 Building Vue frontend...");
  return new Promise((resolve, reject) => {
    exec("cd frontend && npm install && npm run build", (error, stdout, stderr) => {
      if (error) reject(stderr);
      else resolve(stdout);
    });
  });
}

async function moveFrontend() {
  console.log("📂 Moving frontend build into backend folder...");
  const source = join(__dirname, "frontend", "dist");
  if (!fs.existsSync(source)) throw new Error("Frontend build not found!");
  console.log("✅ Frontend ready");
}

async function startBackend() {
  console.log("🚀 Starting backend...");
  return exec("npm run dev");
}

async function startLocaltunnel() {
  console.log("🌍 Starting Localtunnel...");
  const tunnel = await localtunnel({
    port: 5000,
    subdomain: "scholarship-test-123" // 👈 Pick a unique name
  });

  console.log(`\n✅ Public URL: ${tunnel.url}`);
  console.log(`🔗 Forwarding to http://localhost:5000`);

  // Close tunnel on exit
  process.on("SIGINT", () => {
    tunnel.close();
    process.exit();
  });
}

(async () => {
  try {
    await buildFrontend();
    await moveFrontend();
    startBackend();
    setTimeout(startLocaltunnel, 8000); // wait for backend to start
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
