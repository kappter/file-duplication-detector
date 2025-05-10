document.addEventListener("DOMContentLoaded", () => {
    const detectButton = document.getElementById("detectButton");
    const fileInput = document.getElementById("fileInput");
    const duplicatesDiv = document.getElementById("duplicates");
    const warningsDiv = document.getElementById("warnings");

    // Check if all elements exist
    if (!detectButton || !fileInput || !duplicatesDiv || !warningsDiv) {
        console.error("One or more required DOM elements are missing.");
        return;
    }

    detectButton.addEventListener("click", async () => {
        // Clear previous results
        duplicatesDiv.innerHTML = "";
        warningsDiv.innerHTML = "";

        // Check if files are selected
        if (!fileInput.files || fileInput.files.length === 0) {
            warningsDiv.innerHTML = "<p>Please select at least one file.</p>";
            return;
        }

        const files = Array.from(fileInput.files);
        const fileHashes = new Map();

        // Process each file
        for (const file of files) {
            try {
                const hash = await calculateHash(file);
                if (fileHashes.has(hash)) {
                    duplicatesDiv.innerHTML += `<p>Duplicate found: ${file.name} matches ${fileHashes.get(hash)}</p>`;
                } else {
                    fileHashes.set(hash, file.name);
                }
            } catch (error) {
                warningsDiv.innerHTML += `<p>Error processing ${file.name}: ${error.message}</p>`;
            }
        }

        // Display results if no duplicates found
        if (!duplicatesDiv.innerHTML) {
            duplicatesDiv.innerHTML = "<p>No duplicates found.</p>";
        }

        // Add warning about creation dates
        warningsDiv.innerHTML +=
            "<p>Note: Creation dates are based on last modified times, which may differ for edited files.</p>";
    });

    // Simple hash function using file metadata
    async function calculateHash(file) {
        return `${file.name}-${file.size}-${file.lastModified}`;
    }
});
