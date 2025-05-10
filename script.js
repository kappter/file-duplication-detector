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

    if (!fileInput1 || !fileInput2 || !analyzeButton || !fileName1 || !fileName2 || !duplicationProbability || !tableBody || !warningsDiv || !folderInput || !batchScanButton || !batchResults || !batchTableBody || !downloadReportButton) {
        console.error('One or more required DOM elements are missing.');
        return;
    }

    fileInput1.addEventListener('change', () => {
        fileName1.textContent = fileInput1.files[0] ? fileInput1.files[0].name : 'no file selected';
        // Clear folder input when selecting individual files
        folderInput.value = '';
        warningsDiv.innerHTML = '';
        toggleButtons();
    });
    fileInput2.addEventListener('change', () => {
        fileName2.textContent = fileInput2.files[0] ? fileInput2.files[0].name : 'no file selected';
        // Clear folder input when selecting individual files
        folderInput.value = '';
        warningsDiv.innerHTML = '';
        toggleButtons();
    });
    folderInput.addEventListener('change', () => {
        const fileCount = folderInput.files.length;
        warningsDiv.innerHTML = `<p>Selected folder contains ${fileCount} files.</p>`;
        // Clear individual file inputs when selecting a folder
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

        const result = await compareFiles(file1, file2);
        displayComparison(result);
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
        const rows = batchTableBody.querySelectorAll('tr');
        let reportText = 'File Duplication Detector - Batch Scan Report\n\n';
        reportText += 'File Pair\tProbability\tDetails\n';
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            reportText += `${cells[0].textContent}\t${cells[1].textContent}\t${cells[2].textContent}\n`;
        });

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
        // Enable analyzeButton only if both files are selected and no folder is selected
        analyzeButton.disabled = !hasFiles;
        batchScanButton.disabled = !hasFolder;
        // Apply visual feedback only when disabled
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
        console.log(`Analyze Button disabled: ${analyzeButton.disabled}, Has Files: ${hasFiles}, Has Folder: ${hasFolder}`);
    }

    async function compareFiles(file1, file2) {
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
            row.innerHTML = `
                <td class="border p-2 ${highlightClass}">${prop.name}</td>
                <td class="border p-2 ${prop.value1 === prop.value2 ? 'bg-yellow-100' : ''} ${highlightClass}">${prop.value1}</td>
                <td class="border p-2 ${prop.value1 === prop.value2 ? 'bg-yellow-100' : ''} ${highlightClass}">${prop.value2}</td>
            `;
            tableBody.appendChild(row);
        });

        if (result.warnings.length) warningsDiv.innerHTML = `<p>Warnings:</p><p>${result.warnings.join(' ')}</p>`;
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
            return 'Error computing hash';
        }
    }
});