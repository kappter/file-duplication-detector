# File Duplication Detector Frontend

## Overview
This repository contains the frontend for the File Duplication Detector web application, hosted on GitHub Pages. It provides a user interface for teachers to upload two files, send them to a Node.js/Express backend (hosted on Render), and analyze metadata (size, type, creation date, modified date, content hash, EXIF data for images, excluding file name) to estimate duplication probability.

## File Structure
```
file-duplication-detector/
├── index.html
├── script.js
├── styles.css
```

- **index.html**: Defines the UI with file inputs, an analyze button, and a results table, using Tailwind CSS and CDNs for `exif-js` and `js-sha256`.
- **script.js**: Handles file uploads to the backend, extracts EXIF data for images, calculates duplication scores, and displays results.
- **styles.css**: Custom CSS to complement Tailwind, styling the table and UI.

## Deployment (Web-Based, No Command Line)
1. **Create Repository**:
   - Go to https://github.com/new, name it `file-duplication-detector`, set to Public, and create.
2. **Add Files**:
   - Click **Add file** > **Create new file** or **Upload files**.
   - Upload `index.html`, `script.js`, `styles.css` (copy from provided artifacts).
   - In `script.js`, set `BACKEND_URL` to your Render URL (e.g., `https://file-duplication-backend.onrender.com/upload`).
   - Commit to the `main` branch.
3. **Enable GitHub Pages**:
   - Go to **Settings** > **Pages**.
   - Set **Source** to **Deploy from a branch**, **Branch** to `main`, **Folder** to `/ (root)`.
   - Save and wait for deployment (URL: `https://kappter.github.io/file-duplication-detector`).
4. **Test**:
   - Visit the GitHub Pages URL, upload two files, and verify duplication analysis.

## Testing
- Upload identical, modified, and different files to test scoring (hash: 85%, size: 20%, EXIF: 20%, created: 10%, modified: 10%, type: 5%).
- Ensure metadata (especially creation date) is displayed and warnings highlight similarities.
- If the backend fails, the app falls back to client-side analysis (using `lastModified`).

## Limitations
- **Creation Date**: Requires backend for `birthtime`; client-side fallback uses `lastModified`.
- **GitHub Pages**: Static hosting requires a separate backend.
- **Metadata Scope**: Limited to basic metadata and EXIF for images.
- **Privacy**: Files are sent to Render; ensure FERPA compliance.

## License
For educational use. Not for commercial purposes.