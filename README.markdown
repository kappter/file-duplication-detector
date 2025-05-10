# File Duplication Detector

Welcome to the **File Duplication Detector**, a powerful web-based tool designed to identify duplicate files by analyzing key metadata and content. This project, created by Ken Kappie, leverages advanced probability calculations to determine file similarity, with a special emphasis on the "Created" date as a major indicator of duplication.

## Overview

The File Duplication Detector allows you to upload two files or an entire folder and analyze their likelihood of being duplicates based on multiple factors. Unlike traditional tools that rely solely on content hashing, this app prioritizes the "Created" date—recognized as an extremely strong indicator due to the rarity of identical timestamps across different systems (odds estimated at 300,000 to 1 or higher). This makes it ideal for detecting copied or synchronized files, especially in educational or collaborative environments.

## Features

- **Created Date Analysis**: Assigns a 70% weight to matching "Created" dates, reflecting their statistical significance. A match within 1 second strongly suggests duplication.
- **Content Hashing**: Uses SHA-256 to compute a definitive content hash, providing 100% probability when files are identical.
- **Metadata Comparison**: Evaluates Size (10%), Last Modified (10%), and Type (10%) to support the probability calculation.
- **Batch Scanning**: Scan an entire folder for duplicates and generate a report of all duplicate pairs with probabilities above 50%. (Best supported in Chrome/Edge.)
- **Detailed Breakdown**: Displays a probability percentage with a breakdown of each contributing factor.
- **Visual Highlights**: Highlights critical properties (e.g., "Created" and "Content Hash") in green for easy identification.
- **Warnings**: Provides context on the reliability of each indicator, noting the rarity of "Created" date matches.
- **Report Download**: Download a text file of the batch scan report for further analysis.

## How It Works

1. **Compare Two Files**:
   - Select two files (e.g., .txt, .csv, .xlsx, .pde) using the file input fields.
   - Click "Analyze Files" to process the files.
   - View the duplication probability, breakdown, property comparison table, and warnings.
2. **Batch Scan a Folder**:
   - Select a folder using the folder input (supported in Chrome/Edge).
   - Click "Scan Folder for Duplicates" to process all files.
   - View a report of duplicate pairs with probabilities above 50%, including a downloadable text file.
   - Note: Processing may take up to a minute depending on file size, complexity, and folder size.

## Installation & Usage

This is a static web application hosted on GitHub Pages. No installation is required—just visit the live site:

- **Live Demo**: https://kappter.github.io/file-duplication-detector

### Local Setup (Optional)

1. Clone the repository:

   ```
   git clone https://github.com/kappter/file-duplication-detector.git
   ```
2. Navigate to the project directory:

   ```
   cd file-duplication-detector
   ```
3. Install dependencies (if running locally with Node.js):

   ```
   npm install
   ```
4. Build the Tailwind CSS:

   ```
   npm run build
   ```
5. Open `index.html` in a browser or serve it with a local server.

## Technology Stack

- **HTML**: Structure of the web page.
- **CSS/Tailwind**: Styling with a 900px centered frame and fixed footer.
- **JavaScript**: Client-side logic using the Web Crypto API for SHA-256 hashing.
- **XLSX Library**: Support for Excel file analysis (optional feature).

## Contributing

Feel free to fork this repository and submit pull requests. Suggestions for enhancing the "Created" date analysis, batch scanning, or adding new features are welcome!

## License

© 2025 Ken Kappie | File Duplication Detector. For educational use only. All rights reserved.

## Contact

- **More Tools**: Explore additional projects like this.
- **Custom Requests**: Interested in your own tool? Let me know!