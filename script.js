document.addEventListener('DOMContentLoaded', () => {
    const fileInput1 = document.getElementById('fileInput1');
    const fileInput2 = document.getElementById('fileInput2');
    const analyzeButton = document.getElementById('analyzeButton');
    const fileName1 = document.getElementById('fileName1');
    const fileName2 = document.getElementById('fileName2');
    const duplicationProbability = document.getElementById('duplicationProbability');
    const tableBody = document.getElementById('tableBody');
    const warningsDiv = document.getElementById('warnings');

    // Detailed logging to identify missing elements
    if (!fileInput1) console.error('Missing element: fileInput1');
    if (!fileInput2) console.error('Missing element: fileInput2');
    if (!analyzeButton) console.error('Missing element: analyzeButton');
    if (!fileName1) console.error('Missing element: fileName1');
    if (!fileName2) console.error('Missing element: fileName2');
    if (!duplicationProbability) console.error('Missing element: duplicationProbability');
    if (!tableBody) console.error('Missing element: tableBody');
    if (!warningsDiv) console.error('Missing element: warningsDiv');

    if (!analyzeButton || !fileInput1 || !fileInput2 || !fileName1 || !fileName2 || !duplicationProbability || !tableBody || !warningsDiv) {
        console.error('One or more required DOM elements are missing.');
        return;
    }

    fileInput1.addEventListener('change', () => {
        fileName1.textContent = fileInput1.files[0] ? fileInput1.files[0].name : 'no file selected';
    });
    fileInput2.addEventListener('change', () => {
        fileName2.textContent = fileInput2.files[0] ? fileInput2.files[0].name : 'no file selected';
    });

    analyzeButton.addEventListener('click', async () => {
        const file1 = fileInput1.files[0];
        const file2 = fileInput2.files[0];
        tableBody.innerHTML = '';
        warningsDiv.innerHTML = '';
        duplicationProbability.innerHTML = '';

        if (!file1 || !file2) {
            warningsDiv.innerHTML = '<p>Please select both files.</p>';
            return;
        }

        try {
            const size1 = file1.size;
            const size2 = file2.size;
            const type1 = file1.type || 'application/octet-stream';
            const type2 = file2.type || 'application/octet-stream';
            const created1 = file1.lastModified ? new Date(file1.lastModified).toISOString() : 'N/A';
            const created2 = file2.lastModified ? new Date(file2.lastModified).toISOString() : 'N/A';
            const lastModified1 = file1.lastModified ? new Date(file1.lastModified).toISOString() : 'N/A';
            const lastModified2 = file2.lastModified ? new Date(file2.lastModified).toISOString() : 'N/A';
            const contentHash1 = await calculateContentHash(file1);
            const contentHash2 = await calculateContentHash(file2);
            const exifData1 = 'N/A';
            const exifData2 = 'N/A';

            // Convert created dates to timestamps for comparison
            const createdTime1 = file1.lastModified ? new Date(file1.lastModified).getTime() : null;
            const createdTime2 = file2.lastModified ? new Date(file2.lastModified).getTime() : null;
            const isCreatedMatch = createdTime1 && createdTime2 && Math.abs(createdTime1 - createdTime2) < 1000; // Within 1 second

            // Probability calculation with Created date as major factor
            let probability = 0;
            const breakdown = [];

            if (contentHash1 === contentHash2) {
                probability = 100;
                breakdown.push('Content Hash match: 100% (Files are identical)');
            } else {
                const weights = {
                    created: 70,    // Major factor due to statistical rarity
                    size: 10,
                    lastModified: 10,
                    type: 10
                };
                if (isCreatedMatch) {
                    probability += weights.created;
                    breakdown.push(`Created match: +${weights.created}% (Extremely strong indicator)`);
                }
                if (size1 === size2) {
                    probability += weights.size;
                    breakdown.push(`Size match: +${weights.size}%`);
                }
                if (type1 === type2) {
                    probability += weights.type;
                    breakdown.push(`Type match: +${weights.type}%`);
                }
                if (lastModified1 === lastModified2) {
                    probability += weights.lastModified;
                    breakdown.push(`Last Modified match: +${weights.lastModified}%`);
                }
                // Cap probability at 95% if hashes differ
                probability = Math.min(probability, 95);
            }

            // Display probability with breakdown
            duplicationProbability.innerHTML = `
                <p class="text-lg font-semibold">Duplication Probability: ${probability.toFixed(2)}%</p>
                <p class="text-sm text-gray-600">Breakdown:</p>
                <ul class="list-disc list-inside text-sm text-gray-600">
                    ${breakdown.map(item => `<li>${item}</li>`).join('')}
                </ul>
            `;

            // Populate table with highlighted content hash and created rows
            const properties = [
                { name: 'Size (bytes)', value1: size1, value2: size2 },
                { name: 'Type', value1: type1, value2: type2 },
                { name: 'Created', value1: created1, value2: created2, highlight: isCreatedMatch },
                { name: 'Last Modified', value1: lastModified1, value2: lastModified2 },
                { name: 'Content Hash', value1: contentHash1, value2: contentHash2, highlight: true },
                { name: 'EXIF Data', value1: exifData1, value2: exifData2 }
            ];

            properties.forEach(prop => {
                const row = document.createElement('tr');
                const highlightClass = prop.highlight ? 'bg-green-100 font-semibold' : '';
                row.innerHTML = `
                    <td class="border p-2 ${highlightClass}">${prop.name}</td>
                    <td class="border p-2 ${prop.value1 === prop.value2 ? 'bg-yellow-100' : ''} ${highlightClass}">${prop.value1}</td>
                    <td class="border p-2 ${prop.value1 === prop.value2 ? 'bg-yellow-100' : ''} ${highlightClass}">${prop.value2}</td>
                `;
                tableBody.appendChild(row);
            });

            // Add warnings and highlight importance
            const warnings = [];
            if (contentHash1 === contentHash2) {
                warnings.push('Content Hash match confirms these files are identical duplicates.');
            } else {
                warnings.push('Content Hash mismatch indicates these files are not identical, despite similar metadata.');
            }
            if (isCreatedMatch) warnings.push('Files have identical Created dates, an extremely strong indicator of duplication due to the rarity of timestamp matches across systems.');
            if (type1 === type2) warnings.push('Files have identical types, which may support duplication if other metadata match. This is a weak indicator.');
            if (lastModified1 === lastModified2) warnings.push('Files have identical last modified dates, which may suggest copying or synchronized edits. This is a weak indicator due to possible legitimate edits.');
            if (warnings.length) warningsDiv.innerHTML = `<p>Warnings:</p><p>${warnings.join(' ')}</p>`;

        } catch (error) {
            warningsDiv.innerHTML = `<p>Error analyzing files: ${error.message}</p>`;
        }
    });

    async function calculateContentHash(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } catch (error) {
            console.error('Hash computation error:', error);
            return 'Error computing hash';
        }
    }
});