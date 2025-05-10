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

    // Rest of the script remains the same
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

            const matchingProps = [size1 === size2, type1 === type2, lastModified1 === lastModified2, contentHash1 === contentHash2].filter(Boolean).length;
            const totalProps = 4;
            const probability = (matchingProps / totalProps) * 100;
            duplicationProbability.innerHTML = `<p>Duplication Probability: ${probability.toFixed(2)}%</p>`;

            const properties = [
                { name: 'Size (bytes)', value1: size1, value2: size2 },
                { name: 'Type', value1: type1, value2: type2 },
                { name: 'Created', value1: created1, value2: created2 },
                { name: 'Last Modified', value1: lastModified1, value2: lastModified2 },
                { name: 'Content Hash', value1: contentHash1, value2: contentHash2 },
                { name: 'EXIF Data', value1: exifData1, value2: exifData2 }
            ];

            properties.forEach(prop => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border p-2">${prop.name}</td>
                    <td class="border p-2 ${prop.value1 === prop.value2 ? 'bg-yellow-100' : ''}">${prop.value1}</td>
                    <td class="border p-2 ${prop.value1 === prop.value2 ? 'bg-yellow-100' : ''}">${prop.value2}</td>
                `;
                tableBody.appendChild(row);
            });

            const warnings = [];
            if (type1 === type2) warnings.push('Files have identical types, which may support duplication if other metadata match. This is a weak indicator.');
            if (lastModified1 === lastModified2) warnings.push('Files have identical last modified dates, which may suggest copying or synchronized edits. This is a weak indicator due to possible legitimate edits.');
            if (warnings.length) warningsDiv.innerHTML = `<p>Warnings:</p><p>${warnings.join(' ')}</p>`;

        } catch (error) {
            warningsDiv.innerHTML = `<p>Error analyzing files: ${error.message}</p>`;
        }
    });

    async function calculateContentHash(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const hash = Array.from(new Uint8Array(reader.result))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
                resolve(hash.substring(0, 32));
            };
            reader.onerror = () => resolve('Error computing hash');
            reader.readAsArrayBuffer(file);
        });
    }
});
