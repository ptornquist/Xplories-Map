import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // ignore eval warnings
        if (warning.code === "EVAL") return;
        warn(warning);
      },
    },
  },
});
