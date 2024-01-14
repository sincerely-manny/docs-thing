import fs from 'fs';

const dir = 'node_modules/pdfjs-dist/build/pdf.js';
const content = fs.readFileSync(dir, { encoding: 'utf-8' });
fs.writeFileSync(dir, content.replace('"./pdf.worker.js";', `__dirname + "/pdf.worker.js";`));
