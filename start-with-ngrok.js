// start-with-ngrok.js
import { exec } from "child_process";
import ngrok from "ngrok";

// 1. Start the backend
const backend = exec("npm run dev", { cwd: process.cwd() });

backend.stdout.on("data", (data) => {
  console.log(data.toString());
});

backend.stderr.on("data", (data) => {
  console.error(data.toString());
});

// 2. Wait a bit, then start ngrok
setTimeout(async () => {
  try {
    const url = await ngrok.connect(5000);
    console.log(`\n🚀 Public URL: ${url}`);
    console.log(`🔗 Forwarding to http://localhost:5000`);
  } catch (err) {
    console.error("Failed to start ngrok:", err);
  }
}, 5000); // wait 5 seconds for backend to start
