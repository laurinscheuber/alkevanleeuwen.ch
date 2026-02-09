import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const distPath = join(process.cwd(), 'dist', 'index.html');

try {
  let html = readFileSync(distPath, 'utf-8');
  
  // Replace absolute static paths with /studio/ prefixed paths
  html = html.replace(/src="\/static\//g, 'src="/studio/static/');
  html = html.replace(/href="\/static\//g, 'href="/studio/static/');
  
  writeFileSync(distPath, html);
  console.log('Successfully updated asset paths in index.html to /studio/static/');
} catch (error) {
  console.error('Error updating index.html:', error);
  process.exit(1);
}
