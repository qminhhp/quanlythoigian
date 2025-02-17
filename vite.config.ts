import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

const conditionalPlugins = [];
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create a single chunk for React and ReactDOM
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/")
          ) {
            return "react";
          }

          // Create a vendors chunk for other node_modules
          if (id.includes("node_modules")) {
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            return "vendor";
          }

          // Split app code by main features
          if (id.includes("/components/auth/")) {
            return "auth";
          }
          if (id.includes("/components/tasks/")) {
            return "tasks";
          }
          if (id.includes("/components/habits/")) {
            return "habits";
          }
          if (id.includes("/components/blog/")) {
            return "blog";
          }
          if (id.includes("/components/admin/")) {
            return "admin";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react({
      plugins: [...conditionalPlugins],
    }),
    tempo(),
  ],
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
