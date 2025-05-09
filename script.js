document.addEventListener('DOMContentLoaded', () => {
  const file1Input = document.getElementById('file1');
  const file2Input = document.getElementById('file2');
  const compareBtn = document.getElementById('compareBtn');
  const resultsDiv = document.getElementById('results');
  const comparisonTable = document.getElementById('comparisonTable');
  const warningsDiv = document.getElementById('warnings');
  const duplicationScore = document.getElementById('duplicationScore');

  // Replace with your actual Render backend URL
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

    // Send files and lastModified to backend
    const formData = new FormData();
    formData.append('files', file1);
    formData.append('lastModified', file1.lastModified ? new Date(file1.lastModified).toISOString() : 'N/A');
    formData.append('files', file2);
    formData.append('lastModified', file2.lastModified ? new Date(file2.lastModified).toISOString() : 'N/A');
    let meta1, meta2;
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Backend request failed');
      [meta1, meta2] = await response.json();
      console.log('Meta1:', meta1);
      console.log('Meta2:', meta2);
    } catch (error) {
      warningsDiv.innerHTML = `<strong>Error:</strong> Failed to fetch metadata from server: ${error.message}. Falling back to client-side analysis.`;
      meta1 = await getClientMetadata(file1);
      meta2 = await getClientMetadata(file2);
      console.log('Client Meta1:', meta1);
      console.log('Client Meta2:', meta2);
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
      created: 90, // Base score if creation dates match
      hash_if_created: 5, // Additional score if hash matches with creation date
      hash_alone: 50, // Score if hash matches but creation dates don't
      exif: 2, // Identical EXIF data (images)
      size: 1, // Identical size
      modified: 1, // Identical last modified date
      type: 1 // Identical type
    };

    properties.forEach(prop => {
      const row = document.createElement('tr');
      let val1, val2, isSimilar = false, highlightClass = '';
      let scoreAdjustment = 0;

      switch (prop) {
        case 'Size (bytes)':
          val1 = meta1.size;
          val2 = meta2.size;
          if (val1 === val2) {
            scoreAdjustment = weights.size;
            score += scoreAdjustment;
            isSimilar = true;
            highlightClass = 'bg-similar-weak';
            warnings.push('Files have identical sizes, which may indicate duplication or shared origin. This is a weak indicator.');
          }
          break;
        case 'Type':
          val1 = meta1.type;
          val2 = meta2.type;
          if (val1 === val2) {
            scoreAdjustment = weights.type;
            score += scoreAdjustment;
            isSimilar = true;
            highlightClass = 'bg-similar-weak';
            warnings.push('Files have identical types, which may support duplication if other metadata match. This is a weak indicator.');
          }
          break;
        case 'Created':
          val1 = meta1.created || 'N/A';
          val2 = meta2.created || 'N/A';
          if (val1 === val2 && val1 !== 'N/A') {
            score = weights.created;
            isSimilar = true;
            highlightClass = 'bg-similar-strong';
            warnings.push('Files have identical creation dates, strongly suggesting they were created simultaneously or copied. This is a very strong indicator of potential misconduct.');
          }
          break;
        case 'Last Modified':
          val1 = meta1.modified || 'N/A';
          val2 = meta2.modified || 'N/A';
          if (val1 === val2 && val1 !== 'N/A') {
            scoreAdjustment = weights.modified;
            score += scoreAdjustment;
            isSimilar = true;
            highlightClass = 'bg-similar-weak';
            warnings.push('Files have identical last modified dates, which may suggest copying or synchronized edits. This is a weak indicator.');
          }
          break;
        case 'Content Hash':
          val1 = meta1.hash;
          val2 = meta2.hash;
          if (val1 === val2) {
            if (score >= weights.created) { // Creation dates matched
              scoreAdjustment = weights.hash_if_created;
              score += scoreAdjustment; // Add 5 to reach 95
            } else {
              scoreAdjustment = weights.hash_alone;
              score += scoreAdjustment; // Add 50 if no creation date match
            }
            isSimilar = true;
            highlightClass = 'bg-similar-strong';
            warnings.push('Files have identical content hashes, indicating they are identical. This is a very strong indicator of potential academic misconduct.');
          } else if (score >= weights.created) {
            score -= 5; // Reduce score if hashes differ but creation dates match
            warnings.push('Creation dates match, but content hashes differ, suggesting possible edits or different content.');
          }
          break;
        case 'EXIF Data':
          val1 = meta1.exif ? JSON.stringify(meta1.exif, null, 2) : 'N/A';
          val2 = meta2.exif ? JSON.stringify(meta2.exif, null, 2) : 'N/A';
          if (val1 !== 'N/A' && val1 === val2) {
            scoreAdjustment = weights.exif;
            score += scoreAdjustment;
            isSimilar = true;
            highlightClass = 'bg-similar-strong';
            warnings.push('Files have identical EXIF data, suggesting they were taken by the same device or copied. This is a strong indicator.');
          }
          break;
      }

      row.innerHTML = `
        <td class="border p-2">${prop}</td>
        <td class="border p-2">${val1}</td>
        <td class="border p-2">${val2}</td>
      `;
      if (isSimilar) {
        row.classList.add(highlightClass);
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
      created: file.lastModified ? new Date(file.lastModified).toISOString() : 'N/A',
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