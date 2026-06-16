const fs = require('fs');
const content = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');
const lines = content.split('\n');

const startIndex = lines.findIndex(l => l.includes('// Lock workspace is unauthenticated'));
// Look for `return (` after index 350
const endIndex = lines.findIndex((l, i) => l.includes('return (') && i > startIndex + 100);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `  // Conditional Workspace view rendering based on active levels
  // Lock workspace is unauthenticated or lack Admin / Team permissions
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Deny system workspace accesses if role checks fail
  if (!isAdmin && !isTeam) {
    return <Navigate to="/dashboard" replace />;
  }

  return (`;
  
  lines.splice(startIndex, endIndex - startIndex + 1, replacement);
  fs.writeFileSync('src/components/admin/AdminDashboard.tsx', lines.join('\n'));
  console.log("Replaced successfully");
} else {
  console.log("Could not find boundaries", startIndex, endIndex);
}
