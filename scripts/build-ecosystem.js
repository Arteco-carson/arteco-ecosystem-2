const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper to run commands
const run = (cmd, cwd) => {
  console.log(`> Running: ${cmd} in ${cwd}`);
  execSync(cmd, { stdio: 'inherit', cwd });
};

// Helper to copy directory recursively
const copyDir = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

const rootDir = path.resolve(__dirname, '..');
const portalDir = path.join(rootDir, 'arteco-portal');
const acmDir = path.join(rootDir, 'arteco-acm-frontend');

console.log('--- Building Arteco Ecosystem ---');

try {
  // 1. Build Portal
  console.log('\n--- Building Portal ---');
  run('npm run build', portalDir);

  // 2. Build ACM
  console.log('\n--- Building ACM ---');
  run('npm run build', acmDir);

  // 3. Merge ACM into Portal
  console.log('\n--- Merging ACM into Portal/dist/acm ---');
  const source = path.join(acmDir, 'dist');
  const destination = path.join(portalDir, 'dist', 'acm');

  // Ensure parent dist exists (it should after build)
  if (!fs.existsSync(path.join(portalDir, 'dist'))) {
      throw new Error("Portal dist directory missing after build!");
  }

  // Clean previous ACM deployment in portal dist if it exists
  if (fs.existsSync(destination)) {
     console.log('Cleaning previous ACM build in destination...');
     fs.rmSync(destination, { recursive: true, force: true });
  }

  copyDir(source, destination);

  console.log('\n--- Ecosystem Build Complete! ---');
  console.log(`Deploy artifact located at: ${path.join(portalDir, 'dist')}`);

} catch (error) {
  console.error('\n!!! Build Failed !!!');
  console.error(error.message);
  process.exit(1);
}
