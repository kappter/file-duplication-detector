document.addEventListener('DOMContentLoaded', () => {
    const fileInput1 = document.getElementById('fileInput1');
    const fileInput2 = document.getElementById('fileInput2');
    const analyzeButton = document.getElementById('analyzeButton');
    const fileName1 = document.getElementById('fileName1');
    const fileName2 = document.getElementById('fileName2');
    const duplicationProbability = document.getElementById('duplicationProbability');
    const tableBody = document.getElementById('tableBody');
    const warningsDiv = document.getElementById('warnings');
    const folderInput = document.getElementById('folderInput');
    const batchScanButton = document.getElementById('batchScanButton');
    const batchResults = document.getElementById('batchResults');
    const batchTableBody = document.getElementById('batchTableBody');
    const downloadReportButton = document.getElementById('downloadReportButton');
    const resultsSection = document.getElementById('results');

    if (!fileInput1 || !fileInput2 || !analyzeButton || !fileName1 || !fileName2 || !duplicationProbability || !tableBody || !warningsDiv || !folderInput || !batchScanButton || !batchResults || !batchTableBody || !downloadReportButton || !resultsSection) {
        console.error('One or more required DOM elements are missing.');
        return;
    }

    fileInput1.addEventListener('change', () => {
        fileName1.textContent = fileInput1.files[0] ? fileInput1.files[0].name : 'no file selected';
        console.log('fileInput1 changed:', fileInput1.files.length, fileInput1.files[0]?.name);
        folderInput.value = '';
        warningsDiv.innerHTML = '';
        toggleButtons();
    });
    fileInput2.addEventListener('change', () => {
        fileName2.textContent = fileInput2.files[0] ? fileInput2.files[0].name : 'no file selected';
        console.log('fileInput2 changed:', fileInput2.files.length, fileInput2.files[0]?.name);
        folderInput.value = '';
        warningsDiv.innerHTML = '';
        toggleButtons();
    });
    folderInput.addEventListener('change', () => {
        const fileCount = folderInput.files.length;
        console.log('folderInput changed:', fileCount);
        warningsDiv.innerHTML = `<p>Selected folder contains ${fileCount} files.</p>`;
        fileInput1.value = '';
        fileInput2.value = '';
        fileName1.textContent = 'no file selected';
        fileName2.textContent = 'no file selected';
        toggleButtons();
    });

    analyzeButton.addEventListener('click', async () => {
        console.log('Analyze button clicked');
        const file1 = fileInput1.files[0];
        const file2 = fileInput2.files[0];
        tableBody.innerHTML = '';
        warningsDiv.innerHTML = '';
        duplicationProbability.innerHTML = '';
        batchResults.classList.add('hidden');

        if (!file1 || !file2) {
            warningsDiv.innerHTML = '<p class="text-red-600">Please select two files to analyze.</p>';
            return;
        }

        try {
            const result = await compareFiles(file1, file2);
            console.log('Comparison result:', result);
            displayComparison(result);
        } catch (error) {
            console.error('Error during comparison:', error);
            warningsDiv.innerHTML = '<p class="text-red-600">Error analyzing files: ' + error.message + '</p>';
        }
    });

    batchScanButton.addEventListener('click', async () => {
        const files = Array.from(folderInput.files);
        batchTableBody.innerHTML = '';
        duplicationProbability.innerHTML = '';
        tableBody.innerHTML = '';
        warningsDiv.innerHTML = '';
        batchResults.classList.remove('hidden');

        if (files.length < 2) {
            batchTableBody.innerHTML = '<tr><td colspan="3" class="border p-2 text-center">Please select a folder with at least 2 files.</td></tr>';
            return;
        }

        const duplicates = await findDuplicates(files);
        displayBatchReport(duplicates);
    });

    downloadReportButton.addEventListener('click', () => {
        let reportText = 'File Duplication Detector - Report\n\n';

        // Check if batch results are visible
        if (!batchResults.classList.contains('hidden')) {
            const rows = batchTableBody.querySelectorAll('tr');
            if (rows.length > 0) {
                reportText += 'Batch Scan Report\nFile Pair\tProbability\tDetails\n';
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    reportText += `${cells[0].textContent}\t${cells[1].textContent}\t${cells[2].textContent}\n`;
                });
            } else {
                reportText += 'No batch scan results available.\n';
            }
        } 
        // Check if two-file results are visible
        else if (!resultsSection.classList.contains('hidden')) {
            const probability = duplicationProbability.textContent.trim();
            if (tableBody.children.length > 0) {
                reportText += 'Two-File Comparison Report\n';
                reportText += `Duplication Probability: ${probability}\n\n`;
                reportText += 'Property\tFile 1\tFile 2\n';
                const rows = tableBody.querySelectorAll('tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    reportText += `${cells[0].textContent}\t${cells[1].textContent.replace(/<[^>]+>/g, '')}\t${cells[2].textContent.replace(/<[^>]+>/g, '')}\n`;
                });
                const warnings = warningsDiv.textContent.trim();
                if (warnings) reportText += `\nWarnings: ${warnings}\n`;
            } else {
                reportText += 'No two-file comparison results available.\n';
            }
        } else {
            reportText += 'No results available to download.\n';
        }

        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'duplication-report.txt';
        a.click();
        URL.revokeObjectURL(url);
    });

    function toggleButtons() {
        const hasFiles = fileInput1.files.length > 0 && fileInput2.files.length > 0;
        const hasFolder = folderInput.files.length > 0;
        analyzeButton.disabled = !hasFiles;
        batchScanButton.disabled = !hasFolder;
        if (analyzeButton.disabled) {
            analyzeButton.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            analyzeButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        if (batchScanButton.disabled) {
            batchScanButton.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            batchScanButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        console.log(`Analyze Button disabled: ${analyzeButton.disabled}, Has Files: ${hasFiles}, Has Folder: ${hasFolder}, fileInput1: ${fileInput1.files.length}, fileInput2: ${fileInput2.files.length}`);
    }

    async function compareFiles(file1, file2) {
        console.log('Starting compareFiles for:', file1.name, file2.name);
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
        console.log('Hashes computed:', contentHash1, contentHash2);
        const exifData1 = 'N/A';
        const exifData2 = 'N/A';

        const createdTime1 = file1.lastModified ? new Date(file1.lastModified).getTime() : null;
        const createdTime2 = file2.lastModified ? new Date(file2.lastModified).getTime() : null;
        const isCreatedMatch = createdTime1 && createdTime2 && Math.abs(createdTime1 - createdTime2) < 1000;

        let probability = 0;
        const breakdown = [];
        const warnings = [];

        if (contentHash1 === contentHash2) {
            probability = 100;
            breakdown.push('Content Hash match: 100% (Files are identical)');
            warnings.push('Content Hash match confirms these files are identical duplicates.');
        } else {
            const weights = {
                created: 70,
                size: 10,
                lastModified: 10,
                type: 10
            };
            if (isCreatedMatch) {
                probability += weights.created;
                breakdown.push(`Created match: +${weights.created}% (Extremely strong indicator)`);
                warnings.push('Files have identical Created dates, an extremely strong indicator of duplication due to the rarity of timestamp matches across systems.');
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
            probability = Math.min(probability, 95);
            if (!warnings.length) warnings.push('Content Hash mismatch indicates these files are not identical, despite similar metadata.');
        }
        if (type1 === type2) warnings.push('Files have identical types, which may support duplication if other metadata match. This is a weak indicator.');
        if (lastModified1 === lastModified2) warnings.push('Files have identical last modified dates, which may suggest copying or synchronized edits. This is a weak indicator due to possible legitimate edits.');

        return {
            file1Name: file1.name,
            file2Name: file2.name,
            probability,
            breakdown,
            properties: [
                { name: 'Size (bytes)', value1: size1, value2: size2 },
                { name: 'Type', value1: type1, value2: type2 },
                { name: 'Created', value1: created1, value2: created2, highlight: isCreatedMatch },
                { name: 'Last Modified', value1: lastModified1, value2: lastModified2 },
                { name: 'Content Hash', value1: contentHash1, value2: contentHash2, highlight: true },
                { name: 'EXIF Data', value1: exifData1, value2: exifData2 }
            ],
            warnings
        };
    }

    function displayComparison(result) {
        console.log('Displaying comparison result:', result);
        duplicationProbability.innerHTML = `
            <p class="text-lg font-semibold">Duplication Probability: ${result.probability.toFixed(2)}%</p>
            <p class="text-sm text-gray-600">Breakdown:</p>
            <ul class="list-disc list-inside text-sm text-gray-600">
                ${result.breakdown.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;

        result.properties.forEach(prop => {
            const row = document.createElement('tr');
            const highlightClass = prop.highlight ? 'bg-green-100 font-semibold' : '';
            let value1Display = prop.value1;
            let value2Display = prop.value2;

            // Truncate content hash to 10 characters and add hover for full hash
            if (prop.name === 'Content Hash') {
                value1Display = prop.value1.length > 10 ? `${prop.value1.substring(0, 10)}...` : prop.value1;
                value2Display = prop.value2.length > 10 ? `${prop.value2.substring(0, 10)}...` : prop.value2;
                value1Display = `<span class="hash-truncated" title="${prop.value1}">${value1Display}</span>`;
                value2Display = `<span class="hash-truncated" title="${prop.value2}">${value2Display}</span>`;
            }

            row.innerHTML = `
                <td class="border p-2 ${highlightClass}">${prop.name}</td>
                <td class="border p-2 ${prop.value1 === prop.value2 ? 'bg-yellow-100' : ''} ${highlightClass}">${value1Display}</td>
                <td class="border p-2 ${prop.value1 === prop.value2 ? 'bg-yellow-100' : ''} ${highlightClass}">${value2Display}</td>
            `;
            tableBody.appendChild(row);
        });

        if (result.warnings.length) {
            warningsDiv.innerHTML = `<p>Warnings:</p><p>${result.warnings.join(' ')}</p>`;
        }
        console.log('DOM updated with comparison results');
    }

    async function findDuplicates(files) {
        const duplicates = [];
        for (let i = 0; i < files.length; i++) {
            for (let j = i + 1; j < files.length; j++) {
                const result = await compareFiles(files[i], files[j]);
                if (result.probability > 50) {
                    duplicates.push(result);
                }
            }
        }
        return duplicates;
    }

    function displayBatchReport(duplicates) {
        if (duplicates.length === 0) {
            batchTableBody.innerHTML = '<tr><td colspan="3" class="border p-2 text-center">No duplicates found with probability above 50%.</td></tr>';
            return;
        }

        duplicates.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="border p-2">${result.file1Name} vs ${result.file2Name}</td>
                <td class="border p-2">${result.probability.toFixed(2)}%</td>
                <td class="border p-2">${result.breakdown.join('; ')}</td>
            `;
            batchTableBody.appendChild(row);
        });
    }

    async function calculateContentHash(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } catch (error) {
            console.error('Hash computation error:', error);
            throw new Error('Failed to compute content hash');
        }
    }
});