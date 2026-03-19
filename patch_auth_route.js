const fs = require('fs');

let content = fs.readFileSync('src/app/api/threads/route.ts', 'utf8');
content = content.replace(
  "import { authOptions } from '@/lib/authOptions';",
  "import { authOptions } from '@/lib/auth';"
);
fs.writeFileSync('src/app/api/threads/route.ts', content, 'utf8');

content = fs.readFileSync('src/app/api/threads/[id]/messages/route.ts', 'utf8');
content = content.replace(
  "import { authOptions } from '@/lib/authOptions';",
  "import { authOptions } from '@/lib/auth';"
);
fs.writeFileSync('src/app/api/threads/[id]/messages/route.ts', content, 'utf8');

console.log('Fixed authOptions import path back.');
