import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const port = Number(process.env.PORT) || 5174;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port,
  },
});
