import fs from 'fs';
import path from 'path';

const frontendPath = '/media/prof/New Volume/PROJECTS/portfolio/src/data/defaultProjects.json';
const backendPath = path.join(__dirname, '../src/data/seedData.ts');

try {
  const fileData = fs.readFileSync(frontendPath, 'utf8');
  // Just to verify it parses correctly
  JSON.parse(fileData);
  
  const tsContent = `export const defaultData = ${fileData};\n`;
  fs.writeFileSync(backendPath, tsContent, 'utf8');
  console.log("Successfully migrated frontend data to seedData.ts");
} catch (err) {
  console.error("Migration failed:", err);
  process.exit(1);
}
