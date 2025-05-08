document.addEventListener('DOMContentLoaded', () => {
  const file1Input = document.getElementById('file1');
  const file2Input = document.getElementById('file2');
  const compareBtn = document.getElementById('compareBtn');
  const resultsDiv = document.getElementById('results');
  const comparisonTable = document.getElementById('comparisonTable');
  const warningsDiv = document.getElementById('warnings');
  const duplicationScore = document.getElementById('duplicationScore');

  // Replace with your actual Render backend URL after deployment
  const BACKEND_URL = 'https://file-duplication-backend.onrender.com/upload';

  // Enable analyze button when both files are selected
  function checkInputs() {
    compareBtn.disabled = !(file1Input.files.length && file2Input.files.length);
  }

  file1Input.addEventListener('change', checkInputs);
  file2Input.addEventListener('change', checkInputs);

  // Analyze files on button click
  compareBtn.addEventListener('click', async () => {
    const file1 = file1Input.files[0];
    const file2 = file2Input.files[0];
    comparisonTable.innerHTML = '';
    warningsDiv.innerHTML = '';
    duplicationScore.innerHTML = '';
    resultsDiv.classList.remove('hidden');

    // Send files to backend
    const formData = new FormData();
    formData.append('files', file1);
    formData.append('files', file2);
    let meta1, meta2;
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Backend request failed');
      [meta1, meta2] = await response.json();
    } catch (error) {
      warningsDiv.innerHTML = `<strong>Error:</strong> Failed to fetch metadata from server: ${error.message}. Falling back to client-side analysis.`;
      // Fallback to client-side metadata extraction
      meta1 = await getClientMetadata(file1);
      meta2 = await getClientMetadata(file2);
    }

    // Extract EXIF data client-side for images
    if (file1.type.startsWith('image/')) {
      meta1.exif = await getExifData(file1);
    }
    if (file2.type.startsWith('image/')) {
      meta2.exif = await getExifData(file2);
    }

    // Compare metadata and calculate duplication score
    const properties = ['Size (bytes)', 'Type', 'Created', 'Last Modified', 'Content Hash', 'EXIF Data'];
    const warnings = [];
    let score = 0;
    const weights = {
      hash: 85,   // Identical content
      exif: 20,   // Identical EXIF data (images)
      size: 20,   // Identical size
      created: 10,// Identical creation date
      modified: 10, // Identical last modified date
      type: 5     // Identical type
    };

    properties.forEach(prop => {
      const row = document.createElement('tr');
      let val1, val2, isSimilar = false;

      switch (prop) {
        case 'Size (bytes)':
          val1 = meta1.size;
          val2 = meta2.size;
          if (val1 === val2) {
            score += weights.size;
            isSimilar = true;
            warnings.push('Files have identical sizes, which may indicate duplication.');
          }
          break;
        case 'Type':
          val1 = meta1.type;
          val2 = meta2.type;
          if (val1 === val2) {
            score += weights.type;
            isSimilar = true;
          }
          break;
        case 'Created':
          val1 = meta1.created || 'N/A';
          val2 = meta2.created || 'N/A';
          if (val1 === val2 && val1 !== 'N/A') {
            score += weights.created;
            isSimilar = true;
            warnings.push('Files have identical creation dates, which may suggest copying.');
          }
          break;
        case 'Last Modified':
          val1 = meta1.modified || 'N/A';
          val2 = meta1.modified || 'N/A';
          if (val1 === val2 && val1 !== 'N/A') {
            score += weights.modified;
            isSimilar = true;
            warnings.push('Files have identical last modified dates, which may suggest copying.');
          }
          break;
        case 'Content Hash':
          val1 = meta1.hash;
          val2 = meta2.hash;
          if (val1 === val2) {
            score += weights.hash;
            isSimilar = true;
            warnings.push('Files have identical content hashes, strongly indicating duplication.');
          }
          break;
        case 'EXIF Data':
          val1 = meta1.exif ? JSON.stringify(meta1.exif, null, 2) : 'N/A';
          val2 = meta2.exif ? JSON.stringify(meta2.exif, null, 2) : 'N/A';
          if (val1 !== 'N/A' && val1 === val2) {
            score += weights.exif;
            isSimilar = true;
            warnings.push('Files have identical EXIF data, which may indicate same source.');
          }
          break;
      }

      row.innerHTML = `
        <td class="border p-2">${prop}</td>
        <td class="border p-2">${val1}</td>
        <td class="border p-2">${val2}</td>
      `;
      if (isSimilar) {
        row.classList.add('bg-similar');
      }
      comparisonTable.appendChild(row);
    });

    // Cap score at 100
    score = Math.min(score, 100);
    duplicationScore.innerHTML = `Duplication Probability: ${score.toFixed(2)}%`;

    // Display warnings
    if (warnings.length) {
      warningsDiv.innerHTML = '<strong>Warnings:</strong><ul>' + warnings.map(w => `<li>${w}</li>`).join('') + '</ul>';
    } else {
      warningsDiv.innerHTML = 'No significant duplication indicators detected.';
    }
  });

  // Fallback client-side metadata extraction
  async function getClientMetadata(file) {
    const metadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      created: 'N/A',
      modified: file.lastModified ? new Date(file.lastModified).toISOString() : 'N/A',
      hash: await getFileHash(file),
      exif: null
    };
    return metadata;
  }

  // Get file hash using SHA-256
  async function getFileHash(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Get EXIF data using exif-js
  function getExifData(file) {
    return new Promise((resolve, reject) => {
      EXIF.getData(file, function() {
        const exifData = EXIF.getAllTags(this);
        if (Object.keys(exifData).length) {
          resolve(exifData);
        } else {
          resolve(null);
        }
      });
    });
  }
});