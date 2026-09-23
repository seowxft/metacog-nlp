import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Remove all console.log messages from the published version of the task.
  // They still show while developing (npm run dev), but participants cannot
  // open the browser console and read the correct answers.
  esbuild: {
    drop: ["console"],
  },
  server: {
    host: "0.0.0.0",
  },
  preview: {
    // We only need to set allowedHosts here.
    // The port and host are set by the "start" script.
    allowedHosts: ["metacog-nlp.osc-fr1.scalingo.io"],
  },
});
