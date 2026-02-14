import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Copy quran-json to dist folder during build
const copyQuranJsonPlugin = {
  name: "copy-quran-json",
  apply: "build",
  enforce: "post",
  generateBundle() {
    const sourceDir = path.join(__dirname, "quran-json/surah");
    const targetDir = path.join(__dirname, "dist/quran-json/surah");

    try {
      // Check if source exists first
      if (!fs.existsSync(sourceDir)) {
        console.warn("⚠️  quran-json/surah folder not found, skipping copy");
        return;
      }

      // Create target directory
      fs.mkdirSync(targetDir, { recursive: true });

      // Copy all JSON files
      const files = fs.readdirSync(sourceDir);
      const jsonFiles = files.filter((f) => f.endsWith(".json"));

      let copied = 0;
      jsonFiles.forEach((file) => {
        const content = fs.readFileSync(path.join(sourceDir, file), "utf-8");
        fs.writeFileSync(path.join(targetDir, file), content);
        copied++;
      });

      console.log(`✓ Copied ${copied} Quran JSON files to dist/quran-json/`);
    } catch (error) {
      console.warn("⚠️  Error copying quran-json files:", error.message);
    }
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    copyQuranJsonPlugin,
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // Ensure consistent hashing
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = (assetInfo.name || "").split(".");
          const ext = info[info.length - 1] || "";
          if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (ext === "css") {
            return `assets/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
});
