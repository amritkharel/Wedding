import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: `${projectRoot}index.html`,
        invite: `${projectRoot}invite.html`,
        inviteIndex: `${projectRoot}invite/index.html`,
      },
    },
  },
});
