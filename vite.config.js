import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Copy quran-json to public folder during build
const copyQuranJsonPlugin = {
  name: 'copy-quran-json',
  apply: 'build',
  async generateBundle() {
    const sourceDir = path.resolve('quran-json/surah')
    const targetDir = path.resolve('dist/quran-json/surah')
    
    // Create target directory
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    
    // Copy all JSON files
    const files = fs.readdirSync(sourceDir)
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const content = fs.readFileSync(path.join(sourceDir, file), 'utf-8')
        fs.writeFileSync(path.join(targetDir, file), content)
      }
    })
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    copyQuranJsonPlugin,
  ],
})
