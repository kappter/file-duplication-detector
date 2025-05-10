
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function calculateFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function findDuplicates(directory) {
  const fileHashes = new Map();
  const duplicates = new Map();

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        scanDirectory(fullPath);
      } else {
        const hash = calculateFileHash(fullPath);
        
        if (fileHashes.has(hash)) {
          const duplicateList = duplicates.get(hash) || [fileHashes.get(hash)];
          duplicateList.push(fullPath);
          duplicates.set(hash, duplicateList);
        } else {
          fileHashes.set(hash, fullPath);
        }
      }
    });
  }

  scanDirectory(directory);
  return duplicates;
}

// Example usage
const targetDir = process.argv[2] || '.';
console.log(`Scanning directory: ${targetDir}`);

const duplicates = findDuplicates(targetDir);
if (duplicates.size === 0) {
  console.log('No duplicate files found.');
} else {
  console.log('\nDuplicate files found:');
  duplicates.forEach((files, hash) => {
    console.log(`\nHash: ${hash}`);
    files.forEach(file => console.log(`- ${file}`));
  });
}
