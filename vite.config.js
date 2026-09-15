import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// A GitHub project Page is served from /<repo>/, not the domain root, so the
// deploy workflow sets VITE_BASE=/eltoromia/. Local dev and a root-domain
// host both need "/", which is the default.
// Runtime image paths are resolved against this via src/utils/asset.js.
export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [react()],
});
