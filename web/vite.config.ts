import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ims/common": path.resolve(__dirname, "../packages/common/src"),
      "@ims/types": path.resolve(__dirname, "../packages/types/src")
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
