const fs = require('fs');
const content = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');
const lines = content.split('\n');

// Drop lines 219 (0-indexed 218) to 256 (0-indexed 255)
lines.splice(218, 38);

fs.writeFileSync('src/components/admin/AdminDashboard.tsx', lines.join('\n'));
console.log('Fixed');
