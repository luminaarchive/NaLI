const fs = require('fs')
const path = require('path')

const src = path.join(require('os').homedir(), 'Downloads', 'nali-logo.png')
const dest = path.join(__dirname, 'public', 'nali-logo.png')

if (!fs.existsSync(src)) {
  console.error('Source not found:', src)
  process.exit(1)
}

fs.copyFileSync(src, dest)
const { size } = fs.statSync(dest)
console.log(`Written: ${dest} (${size} bytes)`)
