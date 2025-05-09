# File Duplication Detector

The File Duplication Detector is a web-based tool designed to compare two files and assess their likelihood of being duplicates, primarily for detecting potential academic misconduct. It analyzes metadata and content, providing a duplication probability score based on weighted comparisons of key properties.

## Features
- **File Upload**: Upload two files (e.g., images, PDFs, documents) via a user-friendly interface.
- **Metadata Comparison**: Compares file size, type, creation date, last modified date, content hash, and EXIF data (for images).
- **Duplication Score**: Calculates a percentage score indicating the likelihood of duplication.
- **Warnings**: Highlights potential indicators of duplication with detailed explanations.
- **Responsive Design**: Built with Tailwind CSS for a clean, mobile-friendly UI.
- **Client-Side Fallback**: Extracts metadata client-side if the backend is unavailable.

## How It Works
1. **Upload Files**: Select two files using the input fields.
2. **Backend Analysis**: Files are sent to a Render-hosted backend for metadata extraction (e.g., content hash, creation date). If the backend fails, the tool falls back to client-side analysis.
3. **EXIF Extraction**: For image files, EXIF data (e.g., camera details, timestamps) is extracted client-side using `exif-js`.
4. **Comparison**: The tool compares the following properties:
   - **Content Hash**: SHA-256 hash of file contents.
   - **Creation Date**: File creation timestamp.
   - **EXIF Data**: Camera and timestamp data (images only).
   - **Size**: File size in bytes.
   - **Last Modified**: Last modified timestamp.
   - **Type**: File MIME type.
5. **Duplication Score**: A weighted score is calculated based on matching properties, capped at 100%.
6. **Results**: A table displays property comparisons, with matching properties highlighted. Warnings explain potential duplication indicators.

## Duplication Score Calculation
The duplication probability score is calculated by assigning weights to each property when they match between the two files. The weights reflect the strength of each property as an indicator of duplication, particularly for academic misconduct detection. The current weights are:

- **Content Hash**: 50% (identical file contents, the strongest indicator of duplication)
- **Creation Date**: 30% (identical creation timestamps suggest simultaneous creation or copying)
- **EXIF Data**: 10% (identical camera/timestamp data for images)
- **Size**: 4% (identical file sizes, a weak indicator)
- **Last Modified**: 3% (identical last modified dates, less reliable due to edits)
- **Type**: 3% (identical file types, a minimal indicator)

The total score is the sum of weights for matching properties, expressed as a percentage (maximum 100%). For example, if two files have identical content hash and creation date, the score is 50 + 30 = 80%.

## Installation and Usage
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/kappter/file-duplication-detector.git
   ```
2. **Serve the Application**:
   - Open `index.html` in a browser for local testing.
   - Alternatively, deploy to a server (e.g., Render, Netlify) and configure the backend URL in `script.js` (`BACKEND_URL`).
3. **Dependencies**:
   - No installation required for client-side scripts (loaded via CDN: Tailwind CSS, exif-js, js-sha256).
   - Backend requires a Node.js server (see `backend` directory for setup).
4. **Usage**:
   - Upload two files using the input fields.
   - Click "Analyze Files" to compare.
   - Review the results table, duplication score, and warnings.
   - Note: Large files or complex comparisons may take up to a minute.

## Technical Details
- **Frontend**: HTML, JavaScript, Tailwind CSS, with client-side libraries (`exif-js`, `js-sha256`).
- **Backend**: Node.js server (hosted on Render) for metadata extraction and content hashing.
- **Fallback**: Client-side metadata extraction using JavaScript’s File API and SHA-256 hashing.
- **Excel Support**: Handles `.xlsx` files using `XLSX` library to filter blank rows and extract CSV data.
- **Styling**: Custom CSS (`styles.css`) complements Tailwind for table formatting and highlight colors (orange for strong matches, yellow for weak matches).

## Limitations
- Backend availability depends on Render’s free tier, which may spin down with inactivity.
- Creation and modified dates may not be available for all files (falls back to `N/A`).
- EXIF data is only applicable to images.
- Large files may cause delays in processing.

## Contributing
Contributions are welcome! Please:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

## License
© 2025 Ken Kapptie. For educational use only. All rights reserved.

## Links
- [Detailed Info](https://github.com/kappter/file-duplication-detector)
- [More Tools](https://kappter.github.io/portfolio/#projects)
- [Custom Solutions](https://kappter.github.io/portfolio/proposal.html)