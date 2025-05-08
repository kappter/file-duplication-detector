# File Duplication Detector Frontend

## Overview
This repository contains the frontend for the File Duplication Detector web application, hosted on GitHub Pages. It provides a user interface for teachers to upload two files, send them to a Node.js/Express backend (hosted on Render), and analyze metadata (size, type, creation date, modified date, content hash, EXIF data for images, excluding file name) to estimate duplication probability. A fixed footer includes a copyright notice, and the results table is styled to wrap text properly.

## File Structure
```
file-duplication-detector/
├── index.html
├── script.js
├── styles.css
├── README.md
```

- **index.html**: Defines the UI with file inputs, an analyze button, a results table, and a fixed footer with a copyright notice. Uses Tailwind CSS and CDNs for `exif-js` and `js-sha256`.
- **script.js**: Handles file uploads to the backend, extracts EXIF data for images, calculates duplication scores, and displays results with emphasized warnings for suspicious metadata.
- **styles.css**: Custom CSS to complement Tailwind, styling the table (with text wrapping) and footer.
- **README.md**: Documentation for setup and deployment.

## Suspicious Metadata for Duplication
The application highlights metadata that may indicate file duplication, helping teachers spot potential academic misconduct (e.g., a student copying another’s work). These are prioritized as follows:
- **Content Hash** (85% weight): A unique fingerprint of a file’s contents, like a digital ID. If two files have the same content hash, they are identical, strongly suggesting one was copied. This is the most reliable indicator of misconduct.
- **Creation Date** (10% weight): The exact moment a file was created, down to the millisecond (1/1000th of a second). If two files have the same creation date, they were likely created at the same time or one was copied, making it a strong clue of misconduct.
- **EXIF Data** (20% weight, images only): Extra information stored in image files, like the camera used or when the photo was taken. If two images have identical EXIF data, they likely came from the same camera or were copied, a strong sign of misconduct.
- **Size** (20% weight): The file size in bytes. Identical sizes suggest files might be duplicates, especially if other metadata match. This is a moderate clue.
- **Type** (5% weight): The file type (e.g., JPEG, PDF). Identical types are common but weakly suggest duplication when combined with other matches.
- **Last Modified Date** (10% weight): When the file was last edited. Identical modified dates may suggest copying, but this is a weak clue since files can be edited legitimately.

Warnings are enhanced to flag potential academic misconduct, with strong indicators (hash, creation date, EXIF, size) highlighted in orange.

## Deployment (Web-Based, No Command Line)
1. **Create Repository**:
   - Go to https://github.com/new, name it `file-duplication-detector`, set to Public, and create.
2. **Add Files**:
   - Click **Add file** > **Create new file** or **Upload files**.
   - Upload `index.html`, `script.js`, `styles.css`, `README.md` (copy from provided artifacts).
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
- Ensure metadata (especially content hash, creation date, EXIF) is displayed, with warnings highlighting suspicious similarities (e.g., “identical content hashes”).
- Verify table text wraps properly and the footer remains fixed at the bottom.
- If the backend fails, the app falls back to client-side analysis (using `lastModified`).

## Limitations
- **Creation Date**: Requires backend for `birthtime` (millisecond precision); client-side fallback uses `lastModified`. May be unavailable on ext4 file systems.
- **GitHub Pages**: Static hosting requires a separate backend.
- **Metadata Scope**: Limited to basic metadata and EXIF for images.
- **Render Free Tier**: Services sleep after 15 minutes of inactivity.
- **Privacy**: Files are sent to Render; ensure FERPA compliance.

## License
© 2025 File Duplication Detector. For educational use only. Not for commercial purposes.