#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function getNetworkAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

console.log('\n' + colors.green + '🚀 Starting Daily Farm Manager Development Servers' + colors.reset);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(colors.blue + '📱 Frontend (React PWA):' + colors.reset);
console.log('   ' + colors.yellow + '➜' + colors.reset + ' Local:    ' + colors.cyan + 'http://localhost:5173' + colors.reset);
console.log('   ' + colors.yellow + '➜' + colors.reset + ' Network:  ' + colors.cyan + `http://${getNetworkAddress()}:5173` + colors.reset);
console.log();

console.log(colors.blue + '🔧 Backend API (NestJS):' + colors.reset);
console.log('   ' + colors.yellow + '➜' + colors.reset + ' Local:    ' + colors.cyan + 'http://localhost:3000' + colors.reset);
console.log('   ' + colors.yellow + '➜' + colors.reset + ' Swagger:  ' + colors.cyan + 'http://localhost:3000/api' + colors.reset);
console.log();

console.log(colors.blue + '🗄️  Database Tools:' + colors.reset);
console.log('   ' + colors.yellow + '➜' + colors.reset + ' pgAdmin:  ' + colors.cyan + 'http://localhost:5050' + colors.reset);
console.log();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Press Ctrl+C to stop all servers\n');

// Run the concurrent command
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const child = spawn(npm, ['run', 'dev:concurrent'], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code);
});