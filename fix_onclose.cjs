const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/ClientDashboard.tsx', 'utf8');

content = content.replace(/onClick={onClose}/g, "onClick={() => window.location.href = '/'}");

// Also remove `onClose: () => void;` from the interface
content = content.replace(/onClose: \(\) => void;\n/g, "");

fs.writeFileSync('src/components/dashboard/ClientDashboard.tsx', content);
console.log('Fixed onClose');
